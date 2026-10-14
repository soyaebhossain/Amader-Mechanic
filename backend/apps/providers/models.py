import uuid
from django.db import models
from django.contrib.gis.db import models as gis_models
from apps.accounts.models import User

class ProviderProfile(models.Model):
    VERIFICATION_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('suspended', 'Suspended'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    provider_type = models.CharField(max_length=32, default='mechanic')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default='pending')
    is_online = models.BooleanField(default=False)
    current_location = gis_models.PointField(geography=True, srid=4326, null=True, blank=True)
    service_radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)

    def __str__(self):
        return f"Provider: {self.user.phone_number} [{self.verification_status}]"
