import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone
from apps.providers.models import ProviderProfile
from apps.payments.models import FinancialLedgerEntry

class PayoutMethod(models.TextChoices):
    BKASH = 'BKASH', 'bKash B2C Disbursement'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer (BEFTN/NPSB)'

class PayoutStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PROCESSING = 'PROCESSING', 'Processing'
    COMPLETED = 'COMPLETED', 'Completed'
    PARTIALLY_FAILED = 'PARTIALLY_FAILED', 'Partially Failed'
    FAILED = 'FAILED', 'Failed'

class PayoutItemStatus(models.TextChoices):
    QUEUED = 'QUEUED', 'Queued'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    PAID = 'PAID', 'Paid'
    FAILED = 'FAILED', 'Failed'
    REJECTED = 'REJECTED', 'Rejected'

class ProviderPayoutAccount(models.Model):
    """Stores KYC-verified payout destinations."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.OneToOneField(ProviderProfile, on_delete=models.CASCADE, related_name='payout_account')
    preferred_method = models.CharField(max_length=20, choices=PayoutMethod.choices, default=PayoutMethod.BKASH)
    
    # bKash Direct Settlement Details
    bkash_wallet_number = models.CharField(max_length=20, blank=True, null=True) # Normalized +8801XXXXXXXXX
    
    # Bank Account Details (for BEFTN / Routing)
    bank_name = models.CharField(max_length=100, blank=True, null=True) # e.g. City Bank, BRAC Bank
    branch_name = models.CharField(max_length=100, blank=True, null=True)
    routing_number = models.CharField(max_length=15, blank=True, null=True) # 9-digit BD Routing Number
    account_number = models.CharField(max_length=50, blank=True, null=True)
    account_holder_name = models.CharField(max_length=150, blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    hold_payouts = models.BooleanField(default=False) # Fraud or audit block
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PayoutAccount: {self.provider.user.phone_number} ({self.preferred_method})"

class PayoutBatch(models.Model):
    """Aggregate grouping of payouts for an accounting cycle."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch_reference = models.CharField(max_length=64, unique=True, db_index=True)
    payout_method = models.CharField(max_length=20, choices=PayoutMethod.choices)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    total_providers = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=PayoutStatus.choices, default=PayoutStatus.DRAFT, db_index=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Batch #{self.batch_reference} [{self.status}] (৳{self.total_amount})"

class PayoutItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch = models.ForeignKey(PayoutBatch, on_delete=models.CASCADE, related_name='items')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.PROTECT, related_name='payout_items')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payout_method = models.CharField(max_length=20, choices=PayoutMethod.choices)
    destination_target = models.CharField(max_length=100) # Wallet MSISDN or Bank Account No
    status = models.CharField(max_length=20, choices=PayoutItemStatus.choices, default=PayoutItemStatus.QUEUED, db_index=True)
    
    # Financial reconciliation references
    gateway_trx_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    failure_reason = models.TextField(blank=True, null=True)
    
    # M2M link to settled ledger credit rows
    settled_ledger_entries = models.ManyToManyField(FinancialLedgerEntry, related_name='payout_settlements')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PayoutItem #{str(self.id)[:8]} - ৳{self.amount} to {self.destination_target} [{self.status}]"
