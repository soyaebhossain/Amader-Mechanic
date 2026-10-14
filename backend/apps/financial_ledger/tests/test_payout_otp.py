import json
import pytest
from unittest.mock import patch, MagicMock
from django.core.cache import cache
from apps.accounts.models import User
from apps.providers.models import ProviderProfile
from apps.financial_ledger.models import ProviderPayoutAccount, PayoutMethod
from apps.financial_ledger.services.payout_otp import PayoutOTPService


def test_payout_otp_service_lifecycle_and_security():
    """Unit test testing OTP generation, cooldown throttle, 3-attempt lock, and verification without DB dependency."""
    cache.clear()
    provider = MagicMock()
    provider.id = "c3f5d54a-5827-44f2-9596-f00e57ba5c5e"
    provider.user.phone_number = "+8801712345678"
    provider.user.id = "47230491-92b1-4d1a-8532-a52654877395"
    provider.user.preferred_language = "bn-BD"

    payload = {
        "preferred_method": PayoutMethod.BKASH,
        "bkash_wallet_number": "+8801899887766"
    }

    # 1. Initiate OTP change (Mock Celery SMS)
    with patch('apps.notifications.tasks.send_transactional_sms_task.delay') as mock_sms:
        result = PayoutOTPService.initiate_payout_change(provider, payload)
        assert mock_sms.called
        assert "+88017****5678" in result["masked_phone"]

    # 2. Test cooldown block (calling again immediately must raise ValueError)
    with pytest.raises(ValueError, match="অপেক্ষা করুন"):
        PayoutOTPService.initiate_payout_change(provider, payload)

    # 3. Simulate wrong OTP attempt
    with pytest.raises(ValueError, match="ভুল ওটিপি"):
        PayoutOTPService.verify_and_commit_change(provider, "000000")

    # 4. Extract valid staged OTP from cache and commit
    cache_key = PayoutOTPService._get_cache_key(str(provider.id))
    cached_data = json.loads(cache.get(cache_key))
    valid_otp = cached_data["otp"]

    committed_payload = PayoutOTPService.verify_and_commit_change(provider, valid_otp)
    assert committed_payload["bkash_wallet_number"] == "+8801899887766"

    # Confirm cache is cleaned
    assert cache.get(cache_key) is None

    # 5. Test max attempts lockout
    cache.clear()
    with patch('apps.notifications.tasks.send_transactional_sms_task.delay'):
        PayoutOTPService.initiate_payout_change(provider, payload)

    with pytest.raises(ValueError, match="ভুল ওটিপি"):
        PayoutOTPService.verify_and_commit_change(provider, "000000")
    with pytest.raises(ValueError, match="ভুল ওটিপি"):
        PayoutOTPService.verify_and_commit_change(provider, "000000")
    with pytest.raises(ValueError, match="অতিরিক্ত ভুল চেষ্টার কারণে ওটিপি বাতিল করা হয়েছে"):
        PayoutOTPService.verify_and_commit_change(provider, "000000")

    assert cache.get(cache_key) is None


@pytest.mark.django_db
def test_payout_otp_flow_and_commit():
    cache.clear()
    user = User.objects.create(phone_number="+8801712345678", is_active=True)
    provider = ProviderProfile.objects.create(user=user, verification_status='verified')
    account = ProviderPayoutAccount.objects.create(provider=provider, preferred_method=PayoutMethod.BKASH)

    payload = {
        "preferred_method": PayoutMethod.BKASH,
        "bkash_wallet_number": "+8801899887766"
    }

    # 1. Initiate OTP change (Mock Celery SMS)
    with patch('apps.notifications.tasks.send_transactional_sms_task.delay') as mock_sms:
        result = PayoutOTPService.initiate_payout_change(provider, payload)
        assert mock_sms.called
        assert "+88017****5678" in result["masked_phone"]

    # 2. Test cooldown block (calling again immediately must raise ValueError)
    with pytest.raises(ValueError, match="অপেক্ষা করুন"):
        PayoutOTPService.initiate_payout_change(provider, payload)

    # 3. Simulate wrong OTP attempt
    with pytest.raises(ValueError, match="ভুল ওটিপি"):
        PayoutOTPService.verify_and_commit_change(provider, "000000")

    # 4. Extract valid staged OTP from cache and commit
    cache_key = PayoutOTPService._get_cache_key(str(provider.id))
    cached_data = json.loads(cache.get(cache_key))
    valid_otp = cached_data["otp"]

    committed_payload = PayoutOTPService.verify_and_commit_change(provider, valid_otp)
    assert committed_payload["bkash_wallet_number"] == "+8801899887766"

    # Confirm cache is cleaned
    assert cache.get(cache_key) is None
