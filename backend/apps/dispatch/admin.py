from django.contrib import admin
from .models import DispatchOffer

@admin.register(DispatchOffer)
class DispatchOfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'service_request', 'provider', 'status', 'offered_at', 'expires_at')
    list_filter = ('status', 'offered_at')
    search_fields = ('provider__user__phone_number',)
