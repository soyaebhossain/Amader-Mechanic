import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.service_requests.models import ServiceRequest

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    INITIATED = 'INITIATED', 'Initiated'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PaymentProvider(models.TextChoices):
    BKASH = 'BKASH', 'bKash Tokenized'
    SSLCOMMERZ = 'SSLCOMMERZ', 'SSLCommerz'
    NAGAD = 'NAGAD', 'Nagad Direct PGW'

class PaymentIntent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(
        ServiceRequest, on_delete=models.PROTECT, related_name='payments'
    )
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='customer_payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='BDT')
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices)
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True
    )
    
    # Gateway tracking references
    transaction_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    gateway_reference = models.CharField(max_length=150, blank=True, null=True, db_index=True) # bKash paymentID / SSLCommerz tran_id / Nagad paymentReferenceId
    gateway_metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['provider', 'gateway_reference']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"PaymentIntent #{str(self.id)[:8]} - ৳{self.amount} via {self.provider} [{self.status}]"

class WebhookDeliveryAudit(models.Model):
    """Guarantees idempotency and stores raw payloads for regulatory compliance."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=20, choices=PaymentProvider.choices)
    event_id = models.CharField(max_length=120, unique=True, db_index=True) # Idempotency key
    raw_payload = models.JSONField()
    headers = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit {self.provider} - {self.event_id} (Processed: {self.processed})"

class FinancialLedgerEntry(models.Model):
    """Double-entry transaction audit log."""
    ENTRY_TYPES = [
        ('PLATFORM_REVENUE', 'Platform Commission'),
        ('PROVIDER_PAYABLE', 'Provider Job Payout'),
        ('GATEWAY_FEE', 'Gateway Processing Surcharge'),
        ('CUSTOMER_REFUND', 'Customer Refund'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(PaymentIntent, on_delete=models.PROTECT, related_name='ledger_entries')
    entry_type = models.CharField(max_length=30, choices=ENTRY_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='BDT')
    balance_type = models.CharField(max_length=6, choices=[('DEBIT', 'Debit'), ('CREDIT', 'Credit')])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ledger #{str(self.id)[:8]}: {self.entry_type} {self.balance_type} ৳{self.amount}"
