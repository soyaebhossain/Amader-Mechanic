from rest_framework import serializers
from .models import PaymentIntent, FinancialLedgerEntry, PaymentProvider

class PaymentIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentIntent
        fields = [
            'id', 'service_request', 'customer', 'amount', 'currency',
            'provider', 'status', 'transaction_id', 'gateway_reference',
            'gateway_metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'transaction_id', 'created_at', 'updated_at']

class FinancialLedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialLedgerEntry
        fields = ['id', 'payment', 'entry_type', 'amount', 'currency', 'balance_type', 'notes', 'created_at']

class InitiateCheckoutRequestSerializer(serializers.Serializer):
    payment_intent_id = serializers.UUIDField(help_text="UUID of the pending PaymentIntent")
    provider = serializers.ChoiceField(choices=PaymentProvider.choices, default=PaymentProvider.BKASH, help_text="Gateway choice")
    callback_url = serializers.URLField(help_text="Client redirect URL after transaction")

class InitiateCheckoutResponseSerializer(serializers.Serializer):
    redirect_url = serializers.CharField(help_text="Redirect payment gateway URL")
    payment_id = serializers.CharField(required=False, help_text="Gateway session reference")
    order_id = serializers.CharField(required=False)
    gateway_response = serializers.DictField(required=False)
