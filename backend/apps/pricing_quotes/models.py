import uuid
from decimal import Decimal
from django.db import models
from apps.service_requests.models import ServiceRequest
from apps.providers.models import ProviderProfile

class ServiceQuote(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted to Customer'),
        ('approved', 'Approved by Customer'),
        ('rejected', 'Rejected by Customer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='quotes')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='submitted_quotes')
    estimated_labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    estimated_parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    breakdown_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.total_amount = self.estimated_labor_cost + self.estimated_parts_cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Quote #{str(self.id)[:8]} - ৳{self.total_amount} [{self.status}]"
