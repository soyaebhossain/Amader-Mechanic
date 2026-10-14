import requests
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)

class BaseSMSGateway(ABC):
    @abstractmethod
    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """Dispatches an SMS and returns normalized status."""
        pass


class GreenwebSMSGateway(BaseSMSGateway):
    """
    Greenweb BD SMS Gateway implementation using JSON API.
    Supports native UTF-8 Bangla characters without encoding degradation.
    """
    def __init__(self):
        self.endpoint = "http://api.greenweb.com.bd/api.php?json"
        self.token = getattr(settings, 'GREENWEB_SMS_TOKEN', 'mock_token')

    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        payload = {
            "token": self.token,
            "smsdata": [
                {
                    "to": phone,       # Supports +8801XXXXXXXXX or 8801XXXXXXXXX
                    "message": message # Raw UTF-8 Bengali text
                }
            ]
        }
        
        headers = {"Content-Type": "application/json; charset=UTF-8"}

        try:
            response = requests.post(
                self.endpoint, 
                data=json.dumps(payload, ensure_ascii=False).encode('utf-8'), 
                headers=headers, 
                timeout=10
            )
            data = response.json()
            
            # Greenweb returns status per message recipient array
            item_status = data[0] if isinstance(data, list) and len(data) > 0 else {}
            statusmsg = str(item_status.get("statusmsg", "")).lower()

            if "success" in statusmsg or item_status.get("status") == "0":
                return {
                    "is_success": True,
                    "response_code": item_status.get("status", "SUCCESS"),
                    "raw_response": data
                }
            
            return {
                "is_success": False,
                "response_code": item_status.get("status", "FAILED"),
                "raw_response": data
            }
        except Exception as exc:
            logger.error(f"Greenweb SMS Exception: {str(exc)}")
            return {
                "is_success": False,
                "response_code": "TRANSPORT_ERROR",
                "raw_response": {"error": str(exc)}
            }


class BulkSMSBDGateway(BaseSMSGateway):
    """
    BulkSMSBD API implementation.
    Endpoint: http://bulksmsbd.net/api/smsapi
    """
    def __init__(self):
        self.endpoint = "http://bulksmsbd.net/api/smsapi"
        self.api_key = getattr(settings, 'BULKSMSBD_API_KEY', 'mock_api_key')
        self.sender_id = getattr(settings, 'BULKSMSBD_SENDER_ID', 'mock_sender_id')

    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        # Strip leading '+' if required by provider (8801XXXXXXXXX format)
        sanitized_phone = phone.lstrip("+")
        
        params = {
            "api_key": self.api_key,
            "type": "unicode", # Required for Bengali characters
            "number": sanitized_phone,
            "senderid": self.sender_id,
            "message": message
        }

        try:
            response = requests.post(self.endpoint, data=params, timeout=10)
            data = response.json()

            # 1000 = Success code for BulkSMSBD
            if str(data.get("response_code")) == "1000":
                return {
                    "is_success": True,
                    "response_code": "1000",
                    "raw_response": data
                }
            
            return {
                "is_success": False,
                "response_code": str(data.get("response_code")),
                "raw_response": data
            }
        except Exception as exc:
            logger.error(f"BulkSMSBD SMS Exception: {str(exc)}")
            return {
                "is_success": False,
                "response_code": "TRANSPORT_ERROR",
                "raw_response": {"error": str(exc)}
            }
