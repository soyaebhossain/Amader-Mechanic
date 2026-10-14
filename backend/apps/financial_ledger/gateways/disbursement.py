import requests
import logging
from decimal import Decimal
from typing import Dict, Any
from django.conf import settings
from django.core.cache import cache
from apps.financial_ledger.models import PayoutMethod

logger = logging.getLogger(__name__)

class BkashB2CDisbursementClient:
    """
    bKash B2C (Business-to-Consumer) Organization Payout API Client.
    Disburses funds from the Corporate Disbursement Master Wallet to Provider Wallets.
    """
    def __init__(self):
        self.base_url = getattr(settings, 'BKASH_B2C_BASE_URL', 'https://b2c.sandbox.bka.sh/v1.0').rstrip('/')
        self.username = getattr(settings, 'BKASH_B2C_USERNAME', 'sandbox_b2c_user')
        self.password = getattr(settings, 'BKASH_B2C_PASSWORD', 'sandbox_b2c_pass')
        self.app_key = getattr(settings, 'BKASH_B2C_APP_KEY', 'sandbox_b2c_app_key')
        self.app_secret = getattr(settings, 'BKASH_B2C_APP_SECRET', 'sandbox_b2c_app_secret')
        self.cache_key = "bkash_b2c_token"

    def _get_token(self) -> str:
        token = cache.get(self.cache_key)
        if token:
            return token

        url = f"{self.base_url}/b2c/token/grant"
        headers = {
            "Content-Type": "application/json",
            "username": self.username,
            "password": self.password
        }
        res = requests.post(url, json={"app_key": self.app_key, "app_secret": self.app_secret}, headers=headers, timeout=10)
        data = res.json()
        
        if res.status_code == 200 and data.get("statusCode") == "0000":
            token = data["id_token"]
            cache.set(self.cache_key, token, timeout=int(data.get("expires_in", 3600)) - 120)
            return token
            
        raise ValueError(f"bKash B2C Token Grant Error: {data.get('statusMessage')}")

    def transfer_to_wallet(self, recipient_msisdn: str, amount: Decimal, payout_item_id: str) -> Dict[str, Any]:
        """Executes instant fund transfer to provider bKash wallet."""
        url = f"{self.base_url}/b2c/payout/transfer"
        headers = {
            "Content-Type": "application/json",
            "Authorization": self._get_token(),
            "X-APP-Key": self.app_key
        }
        # Format phone to 11 digits: 01XXXXXXXXX
        formatted_phone = recipient_msisdn.lstrip("+")
        if formatted_phone.startswith("88"):
            formatted_phone = formatted_phone[2:]

        payload = {
            "receiverMSISDN": formatted_phone,
            "amount": str(amount.quantize(Decimal('0.01'))),
            "currency": "BDT",
            "merchantInvoiceNumber": f"PO-{str(payout_item_id)[:12]}",
            "intent": "b2c_transfer"
        }

        try:
            res = requests.post(url, json=payload, headers=headers, timeout=20)
            data = res.json()
            if res.status_code == 200 and data.get("statusCode") == "0000":
                return {
                    "is_success": True,
                    "trx_id": data.get("trxID"),
                    "raw": data
                }
            return {
                "is_success": False,
                "error_message": data.get("statusMessage", "Transfer rejected"),
                "raw": data
            }
        except Exception as exc:
            logger.error(f"bKash B2C Request Exception for {formatted_phone}: {str(exc)}")
            return {
                "is_success": False,
                "error_message": str(exc),
                "raw": {"exception": str(exc)}
            }


class BankBEFTNExporter:
    """Exports batch items into standardized Bangladesh BEFTN clearing format."""
    @staticmethod
    def generate_beftn_csv(batch) -> str:
        lines = ["BeneficiaryName,AccountNumber,RoutingNumber,BankName,BranchName,Amount,PaymentReference"]
        for item in batch.items.filter(payout_method=PayoutMethod.BANK_TRANSFER):
            account = item.provider.payout_account
            lines.append(
                f'"{account.account_holder_name}","{account.account_number}","{account.routing_number}",'
                f'"{account.bank_name}","{account.branch_name}",{item.amount:.2f},"BATCH-{batch.batch_reference}"'
            )
        return "\n".join(lines)
