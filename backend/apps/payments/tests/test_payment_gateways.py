import pytest
from decimal import Decimal
from unittest.mock import patch
from django.contrib.gis.geos import Point
from apps.accounts.models import User
from apps.service_requests.models import ServiceRequest
from apps.payments.models import PaymentIntent, PaymentStatus, FinancialLedgerEntry
from apps.payments.services.processor import PaymentProcessorService

@pytest.mark.django_db(transaction=True)
def test_successful_payment_creates_ledger_and_transitions_request():
    customer = User.objects.create(phone_number="+8801711111111", is_active=True)
    service_request = ServiceRequest.objects.create(
        customer=customer,
        status='awaiting_payment',
        pickup_location=Point(90.4125, 23.8103, srid=4326),
        pickup_address="Banani DOHS, Dhaka"
    )

    amount = Decimal("2500.00")
    payment = PaymentIntent.objects.create(
        service_request=service_request,
        customer=customer,
        amount=amount,
        provider='BKASH',
        status=PaymentStatus.INITIATED,
        gateway_reference="TRX_BKASH_999"
    )

    # Process successful callback
    txn_id = "BKH87654321"
    processed = PaymentProcessorService.process_successful_payment(
        payment_intent=payment,
        txn_id=txn_id,
        verified_amount=amount,
        meta={"bank_ref": "bKash-Mock"}
    )

    # 1. Assert payment intent updated
    assert processed.status == PaymentStatus.SUCCESS
    assert processed.transaction_id == txn_id

    # 2. Assert double-entry ledger created
    ledger_entries = FinancialLedgerEntry.objects.filter(payment=processed)
    assert ledger_entries.count() == 2

    commission = ledger_entries.get(entry_type='PLATFORM_REVENUE')
    provider_share = ledger_entries.get(entry_type='PROVIDER_PAYABLE')

    assert commission.amount == Decimal("375.00")      # 15% of 2500
    assert provider_share.amount == Decimal("2125.00") # 85% of 2500

    # 3. Assert service request state machine triggered to 'completed'
    service_request.refresh_from_db()
    assert service_request.status == 'completed'

    # 4. Assert idempotency: executing second time doesn't duplicate entries
    PaymentProcessorService.process_successful_payment(
        payment_intent=payment,
        txn_id=txn_id,
        verified_amount=amount,
        meta={}
    )
    assert FinancialLedgerEntry.objects.filter(payment=processed).count() == 2
