from django.contrib import admin
from .models import PaymentIntent, WebhookDeliveryAudit, FinancialLedgerEntry

@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'amount', 'currency', 'provider', 'status', 'transaction_id', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('transaction_id', 'gateway_reference', 'customer__phone_number')

@admin.register(WebhookDeliveryAudit)
class WebhookDeliveryAuditAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'provider', 'processed', 'processed_at', 'created_at')
    list_filter = ('provider', 'processed')
    search_fields = ('event_id',)

@admin.register(FinancialLedgerEntry)
class FinancialLedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment', 'entry_type', 'amount', 'currency', 'balance_type', 'created_at')
    list_filter = ('entry_type', 'balance_type')
