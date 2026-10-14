from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from apps.providers.models import ProviderProfile
from apps.payments.models import FinancialLedgerEntry
from apps.financial_ledger.models import (
    PayoutBatch, PayoutItem, PayoutMethod, PayoutStatus, PayoutItemStatus
)

class PayoutSettlementService:
    MINIMUM_PAYOUT_THRESHOLD = Decimal('500.00')

    @classmethod
    @transaction.atomic
    def aggregate_and_create_batch(cls, payout_method: PayoutMethod) -> PayoutBatch:
        """
        Calculates unsettled PROVIDER_PAYABLE credits minus any debit adjustments.
        Builds an immutable PayoutBatch ready for execution.
        """
        now = timezone.now()
        batch_ref = f"SETTLE-{payout_method}-{now.strftime('%Y%m%d%H%M%S')}"

        batch = PayoutBatch.objects.create(
            batch_reference=batch_ref,
            payout_method=payout_method,
            status=PayoutStatus.DRAFT
        )

        # 1. Fetch verified providers configured for this payout method
        eligible_providers = ProviderProfile.objects.filter(
            payout_account__is_verified=True,
            payout_account__hold_payouts=False,
            payout_account__preferred_method=payout_method
        ).select_related('payout_account')

        total_batch_amount = Decimal('0.00')
        item_count = 0

        for provider in eligible_providers:
            # 2. Acquire row-level locks on unliquidated ledger credits
            unsettled_entries = (
                FinancialLedgerEntry.objects.select_for_update()
                .filter(
                    payment__service_request__assigned_provider=provider,
                    entry_type='PROVIDER_PAYABLE',
                    payout_settlements__isnull=True
                )
            )

            credits = unsettled_entries.filter(balance_type='CREDIT').aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
            debits = unsettled_entries.filter(balance_type='DEBIT').aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
            net_payable = credits - debits

            if net_payable >= cls.MINIMUM_PAYOUT_THRESHOLD:
                account = provider.payout_account
                target = account.bkash_wallet_number if payout_method == PayoutMethod.BKASH else account.account_number

                payout_item = PayoutItem.objects.create(
                    batch=batch,
                    provider=provider,
                    amount=net_payable,
                    payout_method=payout_method,
                    destination_target=target or "",
                    status=PayoutItemStatus.QUEUED
                )
                
                # Bind ledger entries to this payout item to mark them locked
                payout_item.settled_ledger_entries.set(unsettled_entries)
                total_batch_amount += net_payable
                item_count += 1

        batch.total_amount = total_batch_amount
        batch.total_providers = item_count
        batch.save(update_fields=['total_amount', 'total_providers'])

        return batch

    @classmethod
    @transaction.atomic
    def mark_item_successful(cls, item: PayoutItem, trx_id: str, raw_response: dict):
        """Finalizes payout item and balances the general ledger."""
        item.status = PayoutItemStatus.PAID
        item.gateway_trx_id = trx_id
        item.gateway_response = raw_response
        item.processed_at = timezone.now()
        item.save(update_fields=['status', 'gateway_trx_id', 'gateway_response', 'processed_at'])

        # Create balanced debit ledger entry clearing the provider balance
        for settled_entry in item.settled_ledger_entries.all():
            FinancialLedgerEntry.objects.create(
                payment=settled_entry.payment,
                entry_type='PROVIDER_PAYABLE',
                amount=settled_entry.amount,
                currency='BDT',
                balance_type='DEBIT',
                notes=f"Payout liquidated in Batch {item.batch.batch_reference} (TrxID: {trx_id})"
            )
