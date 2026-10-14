import pytest
from decimal import Decimal
from unittest.mock import patch, MagicMock
from Crypto.PublicKey import RSA
from django.contrib.gis.geos import Point
from apps.accounts.models import User
from apps.service_requests.models import ServiceRequest
from apps.payments.models import PaymentIntent, PaymentStatus, FinancialLedgerEntry
from apps.payments.gateways.nagad_crypto import NagadCrypto
from apps.payments.gateways.nagad import NagadGateway
from apps.payments.services.processor import PaymentProcessorService

@pytest.fixture(scope="session")
def test_rsa_keys():
    """Generates 2048-bit RSA key pair for testing crypto functions."""
    key = RSA.generate(2048)
    private_pem = key.export_key().decode('utf-8')
    public_pem = key.publickey().export_key().decode('utf-8')
    return private_pem, public_pem

def test_nagad_crypto_rsa_and_aes(test_rsa_keys):
    priv_key, pub_key = test_rsa_keys
    sample_text = "Nagad-PGW-Test-Payload"

    # RSA Encrypt/Decrypt
    cipher_b64 = NagadCrypto.encrypt_rsa(sample_text, pub_key)
    decrypted = NagadCrypto.decrypt_rsa(cipher_b64, priv_key)
    assert decrypted == sample_text

    # SHA256 Signature Sign/Verify
    sig_b64 = NagadCrypto.sign_sha256(sample_text, priv_key)
    assert NagadCrypto.verify_signature(sample_text, sig_b64, pub_key) is True
    assert NagadCrypto.verify_signature("Tampered-Data", sig_b64, pub_key) is False

    # AES-128-CBC Encrypt/Decrypt
    aes_key, aes_iv = NagadCrypto.generate_aes_keys()
    test_dict = {"orderId": "ORD-001", "amount": "1500.00"}
    aes_encrypted = NagadCrypto.encrypt_aes_cbc(test_dict, aes_key, aes_iv)
    decrypted_dict = NagadCrypto.decrypt_aes_cbc(aes_encrypted, aes_key, aes_iv)
    assert decrypted_dict == test_dict

@pytest.mark.django_db(transaction=True)
def test_nagad_verification_completes_job_and_ledger():
    customer = User.objects.create(phone_number="+8801822222222", is_active=True)
    service_request = ServiceRequest.objects.create(
        customer=customer,
        status='awaiting_payment',
        pickup_location=Point(90.3752, 23.7509, srid=4326), # Dhanmondi
        pickup_address="Dhanmondi 27, Dhaka"
    )

    amount = Decimal("1800.00")
    payment = PaymentIntent.objects.create(
        service_request=service_request,
        customer=customer,
        amount=amount,
        provider='NAGAD',
        status=PaymentStatus.INITIATED,
        gateway_reference="NAGAD_REF_102030"
    )

    mock_verification_response = {
        "is_successful": True,
        "transaction_id": "NGD_TXN_998877",
        "amount": amount,
        "currency": "BDT",
        "raw": {"status": "Success", "issuerPaymentRefNo": "NGD_TXN_998877"}
    }

    with patch.object(NagadGateway, 'verify_and_capture_transaction', return_value=mock_verification_response):
        gateway = NagadGateway()
        res = gateway.verify_and_capture_transaction({"payment_ref_id": "NAGAD_REF_102030"})
        assert res["is_successful"] is True

        PaymentProcessorService.process_successful_payment(
            payment_intent=payment,
            txn_id=res["transaction_id"],
            verified_amount=res["amount"],
            meta=res["raw"]
        )

    payment.refresh_from_db()
    service_request.refresh_from_db()

    assert payment.status == PaymentStatus.SUCCESS
    assert payment.transaction_id == "NGD_TXN_998877"
    assert service_request.status == "completed"

    # Confirm ledger amounts (15% platform commission)
    commission = FinancialLedgerEntry.objects.get(payment=payment, entry_type='PLATFORM_REVENUE')
    provider_share = FinancialLedgerEntry.objects.get(payment=payment, entry_type='PROVIDER_PAYABLE')

    assert commission.amount == Decimal("270.00")      # 1800 * 0.15
    assert provider_share.amount == Decimal("1530.00") # 1800 - 270
