import pytest
from decimal import Decimal
from unittest.mock import patch
from django.contrib.gis.geos import Point
from apps.accounts.models import User
from apps.providers.models import ProviderProfile
from apps.service_requests.models import ServiceRequest
from apps.payments.models import PaymentIntent, FinancialLedgerEntry
from apps.financial_ledger.models import (
    ProviderPayoutAccount, PayoutBatch, PayoutItem, PayoutMethod, PayoutItemStatus
)
from apps.financial_ledger.services.settlement import PayoutSettlementService
from apps.financial_ledger.tasks import execute_bkash_payout_item

@pytest.mark.django_db(transaction=True)
def test_payout_aggregation_threshold_and_double_entry_settlement():
    # Setup Provider with verified bKash wallet
    provider_user = User.objects.create(phone_number="+8801700112233")
    provider = ProviderProfile.objects.create(user=provider_user, verification_status='verified')
    ProviderPayoutAccount.objects.create(
        provider=provider,
        preferred_method=PayoutMethod.BKASH,
        bkash_wallet_number="+8801700112233",
        is_verified=True
    )

    customer = User.objects.create(phone_number="+8801811998877")
    req = ServiceRequest.objects.create(
        customer=customer,
        assigned_provider=provider,
        status='completed',
        pickup_location=Point(90.4125, 23.8103, srid=4326),
        pickup_address="Dhaka"
    )

    payment = PaymentIntent.objects.create(
        service_request=req,
        customer=customer,
        amount=Decimal("2000.00"),
        provider='BKASH',
        status='SUCCESS'
    )

    # 1. Add credit to provider: ৳1700.00
    FinancialLedgerEntry.objects.create(
        payment=payment,
        entry_type='PROVIDER_PAYABLE',
        amount=Decimal("1700.00"),
        balance_type='CREDIT'
    )

    # 2. Run Batch Aggregation
    batch = PayoutSettlementService.aggregate_and_create_batch(payout_method=PayoutMethod.BKASH)
    assert batch.total_providers == 1
    assert batch.total_amount == Decimal("1700.00")

    item = batch.items.first()
    assert item.destination_target == "+8801700112233"
    assert item.status == PayoutItemStatus.QUEUED

    # 3. Simulate Successful bKash Transfer Task
    mock_b2c_response = {
        "is_success": True,
        "trx_id": "B2C99887766",
        "raw": {"statusCode": "0000", "statusMessage": "Successful"}
    }

    with patch('apps.financial_ledger.gateways.disbursement.BkashB2CDisbursementClient.transfer_to_wallet', return_value=mock_b2c_response), \
         patch('apps.notifications.tasks.send_transactional_sms_task.delay') as mock_sms:
        
        execute_bkash_payout_item(str(item.id))

    item.refresh_from_db()
    assert item.status == PayoutItemStatus.PAID
    assert item.gateway_trx_id == "B2C99887766"

    # Verify debit offset entry exists to clear provider liability
    debit_entry = FinancialLedgerEntry.objects.filter(
        payment=payment,
        entry_type='PROVIDER_PAYABLE',
        balance_type='DEBIT'
    ).first()
    assert debit_entry is not None
    assert debit_entry.amount == Decimal("1700.00")

    # 4. Verify running aggregation again yields zero balance (no duplicate payouts)
    next_batch = PayoutSettlementService.aggregate_and_create_batch(payout_method=PayoutMethod.BKASH)
    assert next_batch.total_providers == 0
    assert next_batch.total_amount == Decimal("0.00")


def test_beftn_csv_export():
    from apps.financial_ledger.gateways.disbursement import BankBEFTNExporter

    class DummyAccount:
        account_holder_name = "Karim Mechanic"
        account_number = "11022334455"
        routing_number = "060271836"
        bank_name = "BRAC Bank"
        branch_name = "Gulshan Branch"

    class DummyProvider:
        payout_account = DummyAccount()

    class DummyItem:
        payout_method = PayoutMethod.BANK_TRANSFER
        amount = Decimal("5500.00")
        provider = DummyProvider()

    class DummyQuerySet(list):
        def filter(self, **kwargs):
            return [i for i in self if i.payout_method == kwargs.get('payout_method')]

    class DummyBatch:
        batch_reference = "202610-01"
        items = DummyQuerySet([DummyItem()])

    csv_data = BankBEFTNExporter.generate_beftn_csv(DummyBatch())
    assert "BeneficiaryName,AccountNumber,RoutingNumber,BankName,BranchName,Amount,PaymentReference" in csv_data
    assert '"Karim Mechanic","11022334455","060271836","BRAC Bank","Gulshan Branch",5500.00,"BATCH-202610-01"' in csv_data
