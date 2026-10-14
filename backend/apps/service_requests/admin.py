from django.contrib import admin
from .models import ServiceRequest, ServiceRequestEvent

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'assigned_provider', 'status', 'pickup_address', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer__phone_number', 'pickup_address')

@admin.register(ServiceRequestEvent)
class ServiceRequestEventAdmin(admin.ModelAdmin):
    list_display = ('service_request', 'from_status', 'to_status', 'actor', 'timestamp')
    list_filter = ('from_status', 'to_status')
