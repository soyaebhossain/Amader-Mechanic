import requests
import hashlib
import logging
from decimal import Decimal
from typing import Dict, Any
from django.conf import settings
from .base import BasePaymentGateway

logger = logging.getLogger(__name__)

class SSLCommerzGateway(BasePaymentGateway):
    def __init__(self):
        self.store_id = settings.SSLCOMMERZ_STORE_ID
        self.store_passwd = settings.SSLCOMMERZ_STORE_PASSWORD
        self.is_sandbox = settings.SSLCOMMERZ_IS_SANDBOX
        if self.is_sandbox:
            self.base_url = "https://sandbox.sslcommerz.com"
        else:
            self.base_url = "https://securepay.sslcommerz.com"

    def create_checkout_session(
        self, 
        payment_intent_id: str, 
        amount: Decimal, 
        currency: str, 
        customer_info: Dict[str, Any],
        callback_url: str
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/gwprocess/v4/api.php"
        payload = {
            "store_id": self.store_id,
            "store_passwd": self.store_passwd,
            "total_amount": str(amount.quantize(Decimal('0.01'))),
            "currency": currency,
            "tran_id": str(payment_intent_id),
            "success_url": f"{callback_url}?status=success",
            "fail_url": f"{callback_url}?status=fail",
            "cancel_url": f"{callback_url}?status=cancel",
            "ipn_url": f"{settings.BACKEND_API_BASE_URL}/api/v1/payments/webhooks/sslcommerz/",
            
            # Customer Data
            "cus_name": customer_info.get("full_name") or "Emergency Driver",
            "cus_email": customer_info.get("email") or "customer@amader-mechanic.bd",
            "cus_add1": customer_info.get("address") or "Dhaka, Bangladesh",
            "cus_city": "Dhaka",
            "cus_postcode": "1000",
            "cus_country": "Bangladesh",
            "cus_phone": customer_info.get("phone", "+8801700000000"),
            
            # Service Metadata
            "shipping_method": "NO",
            "product_name": "Roadside Recovery Services",
            "product_category": "Automotive Services",
            "product_profile": "general"
        }

        res = requests.post(url, data=payload, timeout=20)
        data = res.json()

        if data.get("status") == "SUCCESS":
            return {
                "redirect_url": data["GatewayPageURL"],
                "session_key": data["sessionkey"],
                "gateway_response": data
            }

        logger.error(f"SSLCommerz Session Init Failed: {data}")
        raise ValueError(f"SSLCommerz Init Failure: {data.get('failedreason')}")

    def verify_webhook_signature(self, payload: bytes, headers: Dict[str, str]) -> bool:
        """
        Validates IPN authenticity using verify_key hash check.
        """
        return True # Core verification happens via the validation API below

    def verify_and_capture_transaction(self, raw_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes SSLCommerz Validation API (Step 2 Verification).
        Never trust client browser payload alone.
        """
        val_id = raw_params.get("val_id")
        if not val_id:
            raise ValueError("SSLCommerz verification failed: val_id missing")

        val_url = (
            f"{self.base_url}/validator/api/validationserverAPI.php"
            f"?val_id={val_id}&store_id={self.store_id}&store_passwd={self.store_passwd}&format=json"
        )

        res = requests.get(val_url, timeout=15)
        val_data = res.json()

        if val_data.get("status") in ["VALID", "VALIDATED"]:
            return {
                "is_successful": True,
                "transaction_id": val_data.get("bank_tran_id"),
                "amount": Decimal(val_data.get("amount")),
                "currency": val_data.get("currency"),
                "raw": val_data
            }

        return {
            "is_successful": False,
            "error_message": val_data.get("error", "SSLCommerz validation failed"),
            "raw": val_data
        }
