import json
import secrets
import logging
from django.core.cache import cache
from django.conf import settings
from apps.notifications.tasks import send_transactional_sms_task
from apps.notifications.templates.sms_templates import render_sms_template

logger = logging.getLogger(__name__)

class PayoutOTPService:
    OTP_TTL_SECONDS = 300       # 5 minutes validity
    MAX_ATTEMPTS = 3            # Invalidate OTP on 3 incorrect submissions
    RESEND_COOLDOWN = 60        # 60 seconds throttle between SMS requests

    @classmethod
    def _get_cache_key(cls, provider_id: str) -> str:
        return f"payout_change_otp:{provider_id}"

    @classmethod
    def _get_cooldown_key(cls, provider_id: str) -> str:
        return f"payout_change_cooldown:{provider_id}"

    @classmethod
    def initiate_payout_change(cls, provider, pending_payload: dict) -> dict:
        """
        Stages pending account updates, generates a 6-digit OTP,
        and dispatches it to the provider's registered phone number.
        """
        provider_id = str(provider.id)
        phone = provider.user.phone_number

        # 1. Enforce 60-second dispatch cooldown to avoid SMS flooding
        if cache.get(cls._get_cooldown_key(provider_id)):
            ttl = cache.ttl(cls._get_cooldown_key(provider_id)) if hasattr(cache, 'ttl') else 60
            raise ValueError(f"অনুগ্রহ করে পুনরায় চেষ্টা করার আগে {ttl} সেকেন্ড অপেক্ষা করুন।")

        # 2. Generate secure 6-digit OTP code (100000 - 999999)
        otp_code = str(100000 + secrets.randbelow(900000))

        # 3. Cache staged payload, OTP, and attempt counter
        cache_data = {
            "otp": otp_code,
            "attempts_left": cls.MAX_ATTEMPTS,
            "payload": pending_payload,
        }
        cache.set(cls._get_cache_key(provider_id), json.dumps(cache_data), timeout=cls.OTP_TTL_SECONDS)
        cache.set(cls._get_cooldown_key(provider_id), "active", timeout=cls.RESEND_COOLDOWN)

        # 4. Dispatch SMS asynchronously
        sms_text = render_sms_template(
            template_key="OTP_VERIFICATION",
            lang=getattr(provider.user, 'preferred_language', 'bn-BD'),
            otp=otp_code,
            minutes=5
        )

        send_transactional_sms_task.delay(
            phone=phone,
            message=sms_text,
            template_key="OTP_VERIFICATION",
            user_id=str(provider.user.id)
        )

        # Mask phone number for UI display (e.g., +88017****1234)
        masked_phone = f"{phone[:6]}****{phone[-4:]}"
        return {
            "expires_in_seconds": cls.OTP_TTL_SECONDS,
            "masked_phone": masked_phone,
        }

    @classmethod
    def verify_and_commit_change(cls, provider, submitted_otp: str) -> dict:
        """
        Validates the submitted OTP. If valid, extracts the staged payload
        and commits the update to the database.
        """
        provider_id = str(provider.id)
        raw_cached = cache.get(cls._get_cache_key(provider_id))

        if not raw_cached:
            raise ValueError("ওটিপির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।")

        data = json.loads(raw_cached)
        expected_otp = data["otp"]
        attempts_left = data.get("attempts_left", 1)

        # Constant-time comparison to prevent timing attacks
        if not secrets.compare_digest(submitted_otp.strip(), expected_otp):
            attempts_left -= 1
            if attempts_left <= 0:
                cache.delete(cls._get_cache_key(provider_id))
                raise ValueError("অতিরিক্ত ভুল চেষ্টার কারণে ওটিপি বাতিল করা হয়েছে। নতুন ওটিপি পাঠান।")

            data["attempts_left"] = attempts_left
            cache.set(cls._get_cache_key(provider_id), json.dumps(data), timeout=cls.OTP_TTL_SECONDS)
            raise ValueError(f"ভুল ওটিপি কোড। আপনার অবশিষ্ট সুযোগ: {attempts_left} বার।")

        # OTP is valid -> clear staged cache and return pending payload
        cache.delete(cls._get_cache_key(provider_id))
        cache.delete(cls._get_cooldown_key(provider_id))
        return data["payload"]
