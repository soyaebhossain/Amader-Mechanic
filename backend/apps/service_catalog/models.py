import uuid
from decimal import Decimal
from django.db import models

class ServiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100) # e.g. "Flat Tire Repair", "Battery Jumpstart", "Towing", "Fuel Delivery"
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (৳{self.base_price})"
