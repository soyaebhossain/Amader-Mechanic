import uuid
from django.db import models
from apps.accounts.models import User

class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    license_plate = models.CharField(max_length=30, unique=True)
    vehicle_type = models.CharField(max_length=50) # e.g. Car, Motorbike, CNG, Microbus, Truck
    make = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=50, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    color = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.license_plate} ({self.vehicle_type})"
