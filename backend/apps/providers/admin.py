from django.contrib import admin
from .models import ProviderProfile

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider_type', 'verification_status', 'is_online', 'service_radius_km', 'rating')
    list_filter = ('verification_status', 'is_online', 'provider_type')
    search_fields = ('user__phone_number', 'user__full_name')
