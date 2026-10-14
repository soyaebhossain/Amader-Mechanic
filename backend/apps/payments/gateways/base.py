from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, Any

class BasePaymentGateway(ABC):
    @abstractmethod
    def create_checkout_session(
        self, 
        payment_intent_id: str, 
        amount: Decimal, 
        currency: str, 
        customer_info: Dict[str, Any],
        callback_url: str
    ) -> Dict[str, Any]:
        """Initiates session with gateway and returns checkout redirect URL or session token."""
        pass

    @abstractmethod
    def verify_webhook_signature(self, payload: bytes, headers: Dict[str, str]) -> bool:
        """Cryptographically validates gateway webhook origins."""
        pass

    @abstractmethod
    def verify_and_capture_transaction(self, raw_params: Dict[str, Any]) -> Dict[str, Any]:
        """Executes server-to-server query to verify genuine success and amount."""
        pass
