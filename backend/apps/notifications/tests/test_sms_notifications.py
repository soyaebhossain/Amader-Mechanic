import pytest
from unittest.mock import patch
from apps.accounts.models import User
from apps.notifications.services.sms_formatter import SMSFormatter
from apps.notifications.templates.sms_templates import render_sms_template
from apps.notifications.models import SMSAuditLog, SMSDeliveryStatus
from apps.notifications.tasks import send_transactional_sms_task
from apps.notifications.gateways.sms_gateways import GreenwebSMSGateway

def test_bd_phone_normalization():
    assert SMSFormatter.normalize_bd_phone("01712345678") == "+8801712345678"
    assert SMSFormatter.normalize_bd_phone("+8801812345678") == "+8801812345678"
    assert SMSFormatter.normalize_bd_phone("8801912345678") == "+8801912345678"
    assert SMSFormatter.normalize_bd_phone("01311-998877") == "+8801311998877"

    with pytest.raises(ValueError, match="Invalid Bangladeshi mobile number"):
        SMSFormatter.normalize_bd_phone("01112345678") # Invalid 011 prefix

def test_bangla_unicode_detection_and_part_accounting():
    bangla_msg = render_sms_template("OTP_VERIFICATION", "bn-BD", otp="4521", minutes="5")
    is_unicode, chars, parts = SMSFormatter.calculate_sms_parts(bangla_msg)
    
    assert is_unicode is True
    assert parts >= 1
    assert "৪৫২১" not in bangla_msg # kwargs formatted correctly as numbers

    english_msg = "Amader Mechanic OTP: 4521. Valid 5 mins."
    is_unicode_en, _, parts_en = SMSFormatter.calculate_sms_parts(english_msg)
    assert is_unicode_en is False
    assert parts_en == 1

@pytest.mark.django_db
def test_sms_task_execution():
    customer = User.objects.create(phone_number="+8801711223344")
    message = "আমাদের মেকানিক টেস্ট মেসেজ"

    mock_response = {
        "is_success": True,
        "response_code": "0",
        "raw_response": [{"statusmsg": "Success", "status": "0"}]
    }

    with patch.object(GreenwebSMSGateway, 'send_sms', return_value=mock_response):
        # Execute Celery synchronously for the test
        send_transactional_sms_task.apply(args=[
            customer.phone_number, message, "TEST_TEMPLATE", str(customer.id)
        ])

    audit = SMSAuditLog.objects.get(recipient_phone="+8801711223344")
    assert audit.status == SMSDeliveryStatus.SENT
    assert audit.is_unicode is True
    assert audit.rendered_message == message
    assert audit.provider_response_code == "0"
