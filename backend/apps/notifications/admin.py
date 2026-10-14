from django.contrib import admin
from .models import SMSAuditLog

@admin.register(SMSAuditLog)
class SMSAuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'recipient_phone', 'template_key', 'provider', 
        'status', 'is_unicode', 'character_count', 'estimated_parts', 'created_at'
    )
    list_filter = ('status', 'provider', 'template_key', 'is_unicode', 'created_at')
    search_fields = ('recipient_phone', 'rendered_message', 'provider_response_code')
