import json
import logging
import requests
import base64
import os
from decimal import Decimal
from typing import Dict, Any
from datetime import datetime
from django.conf import settings
from django.core.cache import cache
from .base import BasePaymentGateway
from .nagad_crypto import NagadCrypto

logger = logging.getLogger(__name__)

class NagadGateway(BasePaymentGateway):
    def __init__(self):
        self.merchant_id = settings.NAGAD_MERCHANT_ID
        self.base_url = settings.NAGAD_BASE_URL.rstrip('/')
        self.merchant_private_key = settings.NAGAD_MERCHANT_PRIVATE_KEY
        self.nagad_public_key = settings.NAGAD_PGW_PUBLIC_KEY

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-KM-Api-Version": "v-0.2",
            "X-KM-IP-V4": settings.NAGAD_SERVER_IP,
            "X-KM-Client-Type": "PC_WEB"
        }

    def create_checkout_session(
        self, 
        payment_intent_id: str, 
        amount: Decimal, 
        currency: str, 
        customer_info: Dict[str, Any],
        callback_url: str
    ) -> Dict[str, Any]:
        """
        Executes two-phase checkout handshake:
        Phase 1: Initialize payment session
        Phase 2: Complete order submission and retrieve redirect URL
        """
        now_str = datetime.now().strftime("%Y%m%d%H%M%S")
        order_id = f"NGD-{payment_intent_id[:16]}"
        
        # 1. Generate Session AES Key and IV
        aes_key, aes_iv = NagadCrypto.generate_aes_keys()

        # Phase 1: Initialize
        init_sensitive_data = {
            "merchantId": self.merchant_id,
            "datetime": now_str,
            "orderId": order_id,
            "challenge": base64.b64encode(os.urandom(20)).decode('utf-8')
        }
        
        init_plain_text = json.dumps(init_sensitive_data, separators=(',', ':'))
        init_encrypted = NagadCrypto.encrypt_rsa(init_plain_text, self.nagad_public_key)
        init_signature = NagadCrypto.sign_sha256(init_plain_text, self.merchant_private_key)

        init_payload = {
            "dateTime": now_str,
            "sensitiveData": init_encrypted,
            "signature": init_signature
        }

        init_url = f"{self.base_url}/check-out/initialize/{self.merchant_id}/{order_id}"
        init_res = requests.post(init_url, json=init_payload, headers=self._get_headers(), timeout=15)
        init_data = init_res.json()

        if init_res.status_code != 200 or "sensitiveData" not in init_data:
            logger.error(f"Nagad Initialize Failed: {init_data}")
            raise ValueError(f"Nagad initialization failed: {init_data.get('message', 'Unknown error')}")

        # Decrypt Nagad initialization response using Merchant Private Key
        decrypted_init_raw = NagadCrypto.decrypt_rsa(init_data["sensitiveData"], self.merchant_private_key)
        decrypted_init = json.loads(decrypted_init_raw)

        payment_ref_id = decrypted_init.get("paymentReferenceId")
        if not payment_ref_id:
            raise ValueError("Payment Reference ID missing in Nagad initialization response")

        # Cache negotiated AES key and IV for callback validation (15-minute TTL)
        cache.set(
            f"nagad_session_{payment_ref_id}", 
            {"key": aes_key.hex(), "iv": aes_iv.hex(), "order_id": order_id}, 
            timeout=900
        )

        # Phase 2: Complete
        complete_sensitive_data = {
            "merchantId": self.merchant_id,
            "orderId": order_id,
            "currencyCode": "050", # BDT ISO-4217 code
            "amount": str(amount.quantize(Decimal('0.01'))),
            "challenge": decrypted_init["challenge"]
        }

        complete_encrypted = NagadCrypto.encrypt_aes_cbc(complete_sensitive_data, aes_key, aes_iv)
        complete_plain_text = json.dumps(complete_sensitive_data, separators=(',', ':'))
        complete_signature = NagadCrypto.sign_sha256(complete_plain_text, self.merchant_private_key)

        # Encrypt the AES key itself with Nagad Public Key so Nagad can decrypt the payload
        merchant_additional_info = {
            "key": base64.b64encode(aes_key).decode('utf-8'),
            "iv": base64.b64encode(aes_iv).decode('utf-8')
        }
        encrypted_additional_info = NagadCrypto.encrypt_rsa(
            json.dumps(merchant_additional_info, separators=(',', ':')),
            self.nagad_public_key
        )

        complete_payload = {
            "sensitiveData": complete_encrypted,
            "signature": complete_signature,
            "merchantCallbackURL": callback_url,
            "additionalMerchantInfo": encrypted_additional_info
        }

        complete_url = f"{self.base_url}/check-out/complete/{payment_ref_id}"
        complete_res = requests.post(complete_url, json=complete_payload, headers=self._get_headers(), timeout=15)
        complete_data = complete_res.json()

        if complete_res.status_code == 200 and complete_data.get("status") == "Success":
            return {
                "redirect_url": complete_data["callBackUrl"],
                "payment_id": payment_ref_id,
                "order_id": order_id,
                "gateway_response": complete_data
            }

        logger.error(f"Nagad Complete Failed: {complete_data}")
        raise ValueError(f"Nagad complete order failed: {complete_data.get('message', 'Checkout error')}")

    def verify_webhook_signature(self, payload: bytes, headers: Dict[str, str]) -> bool:
        return True

    def verify_and_capture_transaction(self, raw_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes Server-to-Server Payment Verification API:
        GET /verify/payment/{payment_ref_id}
        """
        payment_ref_id = raw_params.get("payment_ref_id")
        if not payment_ref_id:
            raise ValueError("payment_ref_id missing in Nagad verification request")

        verify_url = f"{self.base_url}/verify/payment/{payment_ref_id}"
        res = requests.get(verify_url, headers=self._get_headers(), timeout=15)
        data = res.json()

        if res.status_code == 200 and data.get("status") == "Success":
            return {
                "is_successful": True,
                "transaction_id": data.get("issuerPaymentRefNo") or payment_ref_id,
                "amount": Decimal(data["amount"]),
                "currency": "BDT",
                "raw": data
            }

        return {
            "is_successful": False,
            "error_message": data.get("message", "Nagad payment verification failed"),
            "raw": data
        }
