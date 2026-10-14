import uuid
from django.db import models
from apps.service_requests.models import ServiceRequest
from apps.providers.models import ProviderProfile

class DispatchOffer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='offers')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='offers')
    status = models.CharField(max_length=20, default='offered') # offered, accepted, rejected, expired
    offered_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('service_request', 'provider')

    def __str__(self):
        return f"Offer #{str(self.id)[:8]} for Job #{str(self.service_request.id)[:8]} to {self.provider.user.phone_number} [{self.status}]"
