import requests
import json
import logging
from decimal import Decimal
from typing import Dict, Any
from django.conf import settings
from django.core.cache import cache
from .base import BasePaymentGateway

logger = logging.getLogger(__name__)

class BkashTokenizedGateway(BasePaymentGateway):
    def __init__(self):
        self.base_url = settings.BKASH_BASE_URL.rstrip('/')
        self.app_key = settings.BKASH_APP_KEY
        self.app_secret = settings.BKASH_APP_SECRET
        self.username = settings.BKASH_USERNAME
        self.password = settings.BKASH_PASSWORD
        self.cache_key = "bkash_grant_token"

    def _get_id_token(self) -> str:
        token = cache.get(self.cache_key)
        if token:
            return token

        url = f"{self.base_url}/tokenized/checkout/token/grant"
        headers = {
            "Content-Type": "application/json",
            "username": self.username,
            "password": self.password
        }
        body = {
            "app_key": self.app_key,
            "app_secret": self.app_secret
        }

        response = requests.post(url, headers=headers, json=body, timeout=10)
        data = response.json()

        if response.status_code == 200 and data.get("statusCode") == "0000":
            id_token = data["id_token"]
            expires_in = int(data.get("expires_in", 3600)) - 60
            cache.set(self.cache_key, id_token, timeout=expires_in)
            return id_token
        
        logger.error(f"bKash Token Grant Failed: {data}")
        raise ValueError(f"Failed to authenticate with bKash: {data.get('statusMessage')}")

    def _get_auth_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": self._get_id_token(),
            "X-APP-Key": self.app_key
        }

    def create_checkout_session(
        self, 
        payment_intent_id: str, 
        amount: Decimal, 
        currency: str, 
        customer_info: Dict[str, Any],
        callback_url: str
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/tokenized/checkout/create"
        payload = {
            "mode": "0011", # Immediate Sale
            "payerReference": customer_info.get("phone", "01700000000"),
            "callbackURL": callback_url,
            "amount": str(amount.quantize(Decimal('0.01'))),
            "currency": currency,
            "intent": "sale",
            "merchantInvoiceNumber": f"INV-{payment_intent_id[:12]}"
        }

        res = requests.post(url, headers=self._get_auth_headers(), json=payload, timeout=15)
        data = res.json()

        if res.status_code == 200 and data.get("statusCode") == "0000":
            return {
                "redirect_url": data["bkashURL"],
                "payment_id": data["paymentID"],
                "gateway_response": data
            }

        logger.error(f"bKash Create Payment Failed: {data}")
        raise ValueError(f"bKash Checkout Init Error: {data.get('statusMessage')}")

    def verify_webhook_signature(self, payload: bytes, headers: Dict[str, str]) -> bool:
        # bKash executes redirect callbacks or webhook push with signature verification.
        # Fall back to server-to-server execute confirmation:
        return True

    def verify_and_capture_transaction(self, raw_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes and confirms bKash transaction server-to-server.
        """
        payment_id = raw_params.get("paymentID")
        if not payment_id:
            raise ValueError("paymentID missing from callback parameters.")

        url = f"{self.base_url}/tokenized/checkout/execute"
        body = {"paymentID": payment_id}

        res = requests.post(url, headers=self._get_auth_headers(), json=body, timeout=15)
        data = res.json()

        if res.status_code == 200 and data.get("statusCode") == "0000":
            return {
                "is_successful": True,
                "transaction_id": data["trxID"],
                "amount": Decimal(data["amount"]),
                "currency": data["currency"],
                "raw": data
            }

        return {
            "is_successful": False,
            "error_message": data.get("statusMessage", "Unknown bKash failure"),
            "raw": data
        }
