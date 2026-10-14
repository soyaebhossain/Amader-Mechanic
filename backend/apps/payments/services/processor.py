from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.payments.models import (
    PaymentIntent, PaymentStatus, WebhookDeliveryAudit, FinancialLedgerEntry
)
from apps.service_requests.services.state_machine import RequestStateMachine
from apps.notifications.tasks import send_transactional_sms_task
from apps.notifications.templates.sms_templates import render_sms_template

class PaymentProcessorService:
    PLATFORM_COMMISSION_RATE = Decimal("0.15") # 15% Platform take

    @classmethod
    @transaction.atomic
    def process_successful_payment(cls, payment_intent: PaymentIntent, txn_id: str, verified_amount: Decimal, meta: dict):
        # 1. Lock payment row to prevent race conditions
        locked_payment = PaymentIntent.objects.select_for_update().get(id=payment_intent.id)
        
        if locked_payment.status == PaymentStatus.SUCCESS:
            return locked_payment # Idempotent no-op

        if locked_payment.amount != verified_amount:
            locked_payment.status = PaymentStatus.FAILED
            locked_payment.gateway_metadata = {
                "error": "Amount mismatch between intent and captured transaction",
                "intent_amount": str(locked_payment.amount),
                "verified_amount": str(verified_amount)
            }
            locked_payment.save(update_fields=['status', 'gateway_metadata'])
            raise ValueError("Transaction amount does not match payment intent amount.")

        # 2. Update Payment State
        locked_payment.status = PaymentStatus.SUCCESS
        locked_payment.transaction_id = txn_id
        locked_payment.gateway_metadata = meta
        locked_payment.save(update_fields=['status', 'transaction_id', 'gateway_metadata', 'updated_at'])

        # 3. Create Double-Entry Accounting Records
        platform_fee = (verified_amount * cls.PLATFORM_COMMISSION_RATE).quantize(Decimal("0.01"))
        provider_payable = verified_amount - platform_fee

        # Platform credit
        FinancialLedgerEntry.objects.create(
            payment=locked_payment,
            entry_type='PLATFORM_REVENUE',
            amount=platform_fee,
            balance_type='CREDIT',
            notes="15% Base roadside platform commission"
        )

        # Provider credit
        FinancialLedgerEntry.objects.create(
            payment=locked_payment,
            entry_type='PROVIDER_PAYABLE',
            amount=provider_payable,
            balance_type='CREDIT',
            notes=f"Payable for Job #{locked_payment.service_request_id}"
        )

        # 4. Advance Service Request State
        service_request = locked_payment.service_request
        RequestStateMachine.transition_to(
            service_request=service_request,
            new_status='completed',
            actor=locked_payment.customer,
            reason=f"Payment verified via {locked_payment.provider} (TrxID: {txn_id})"
        )

        # 5. Dispatch Transactional SMS Notification
        try:
            customer = locked_payment.customer
            user_lang = getattr(customer, 'preferred_language', 'bn-BD')
            sms_text = render_sms_template(
                template_key="PAYMENT_SUCCESS",
                lang=user_lang,
                amount=str(verified_amount),
                txn_id=txn_id
            )
            send_transactional_sms_task.delay(
                phone=customer.phone_number,
                message=sms_text,
                template_key="PAYMENT_SUCCESS",
                user_id=str(customer.id)
            )
        except Exception as e:
            # Notifications failure must not roll back financial settlement
            import logging
            logging.getLogger(__name__).error(f"Failed to trigger payment success SMS: {e}")

        return locked_payment
