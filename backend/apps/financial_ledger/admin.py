from django.contrib import admin
from .models import ProviderPayoutAccount, PayoutBatch, PayoutItem

@admin.register(ProviderPayoutAccount)
class ProviderPayoutAccountAdmin(admin.ModelAdmin):
    list_display = ('provider', 'preferred_method', 'bkash_wallet_number', 'bank_name', 'account_number', 'is_verified', 'hold_payouts')
    list_filter = ('preferred_method', 'is_verified', 'hold_payouts')
    search_fields = ('provider__user__phone_number', 'bkash_wallet_number', 'account_number', 'account_holder_name')

@admin.register(PayoutBatch)
class PayoutBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_reference', 'payout_method', 'total_amount', 'total_providers', 'status', 'executed_at', 'created_at')
    list_filter = ('payout_method', 'status', 'created_at')
    search_fields = ('batch_reference',)

@admin.register(PayoutItem)
class PayoutItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'batch', 'provider', 'amount', 'payout_method', 'destination_target', 'status', 'gateway_trx_id', 'processed_at')
    list_filter = ('payout_method', 'status', 'created_at')
    search_fields = ('destination_target', 'gateway_trx_id', 'provider__user__phone_number')
