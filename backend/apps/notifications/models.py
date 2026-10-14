import uuid
from django.db import models
from apps.accounts.models import User

class SMSDeliveryStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SENT = 'SENT', 'Sent'
    DELIVERED = 'DELIVERED', 'Delivered'
    FAILED = 'FAILED', 'Failed'

class SMSAuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sms_logs')
    recipient_phone = models.CharField(max_length=20, db_index=True)
    template_key = models.CharField(max_length=50, db_index=True)
    rendered_message = models.TextField()
    is_unicode = models.BooleanField(default=True)
    character_count = models.PositiveIntegerField()
    estimated_parts = models.PositiveSmallIntegerField(default=1)
    
    provider = models.CharField(max_length=30, default='GREENWEB')
    provider_response_code = models.CharField(max_length=50, blank=True, null=True)
    provider_raw_response = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=SMSDeliveryStatus.choices, 
        default=SMSDeliveryStatus.PENDING,
        db_index=True
    )
    retry_count = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f"SMS to {self.recipient_phone} [{self.template_key}]: {self.status}"
