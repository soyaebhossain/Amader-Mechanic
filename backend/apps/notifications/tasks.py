import logging
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import SMSAuditLog, SMSDeliveryStatus
from .services.sms_formatter import SMSFormatter
from .gateways.sms_gateways import GreenwebSMSGateway, BulkSMSBDGateway

logger = logging.getLogger(__name__)

def get_configured_gateway():
    provider_name = getattr(settings, 'ACTIVE_SMS_GATEWAY', 'GREENWEB').upper()
    if provider_name == 'BULKSMSBD':
        return BulkSMSBDGateway(), 'BULKSMSBD'
    return GreenwebSMSGateway(), 'GREENWEB'

@shared_task(bind=True, max_retries=3, default_retry_delay=15)
def send_transactional_sms_task(self, phone: str, message: str, template_key: str, user_id: str = None):
    # 1. Normalize phone & calculate Unicode characters
    normalized_phone = SMSFormatter.normalize_bd_phone(phone)
    is_unicode, char_count, parts = SMSFormatter.calculate_sms_parts(message)

    gateway, gateway_name = get_configured_gateway()

    retries = getattr(self.request, 'retries', 0) if hasattr(self, 'request') and self.request else 0

    # 2. Persist audit log in Pending status
    audit_record = SMSAuditLog.objects.create(
        recipient_user_id=user_id,
        recipient_phone=normalized_phone,
        template_key=template_key,
        rendered_message=message,
        is_unicode=is_unicode,
        character_count=char_count,
        estimated_parts=parts,
        provider=gateway_name,
        status=SMSDeliveryStatus.PENDING,
        retry_count=retries
    )

    # 3. Dispatch to Gateway
    result = gateway.send_sms(normalized_phone, message)

    audit_record.provider_response_code = result.get("response_code")
    audit_record.provider_raw_response = result.get("raw_response", {})

    if result.get("is_success"):
        audit_record.status = SMSDeliveryStatus.SENT
        audit_record.save(update_fields=['status', 'provider_response_code', 'provider_raw_response', 'updated_at'])
        return f"SMS sent successfully to {normalized_phone} (ID: {audit_record.id})"

    audit_record.status = SMSDeliveryStatus.FAILED
    audit_record.save(update_fields=['status', 'provider_response_code', 'provider_raw_response', 'updated_at'])

    # 4. Trigger Celery Retry if failed
    if retries < getattr(self, 'max_retries', 3):
        logger.warning(f"Retrying SMS for {normalized_phone} due to gateway response: {result}")
        if hasattr(self, 'retry'):
            raise self.retry(exc=Exception(f"SMS Gateway Error: {result.get('response_code')}"))

    return f"SMS permanently failed to {normalized_phone}."
