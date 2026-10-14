import uuid
from django.db import models
from django.contrib.gis.db import models as gis_models
from apps.accounts.models import User
from apps.providers.models import ProviderProfile

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('matching', 'Matching'),
        ('assigned', 'Assigned'),
        ('en_route', 'En Route'),
        ('arrived', 'Arrived'),
        ('inspection', 'Inspection'),
        ('awaiting_quote_approval', 'Awaiting Quote Approval'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_requests')
    assigned_provider = models.ForeignKey(ProviderProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_requests')
    status = models.CharField(max_length=36, choices=STATUS_CHOICES, default='requested', db_index=True)
    pickup_location = gis_models.PointField(geography=True, srid=4326)
    pickup_address = models.TextField()
    problem_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request #{str(self.id)[:8]} - {self.customer.phone_number} [{self.status}]"

class ServiceRequestEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='status_events')
    from_status = models.CharField(max_length=36)
    to_status = models.CharField(max_length=36)
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='request_events')
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Event: {self.from_status} -> {self.to_status} ({self.timestamp})"
