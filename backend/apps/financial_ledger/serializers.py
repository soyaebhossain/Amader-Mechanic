import re
from rest_framework import serializers
from .models import ProviderPayoutAccount, PayoutMethod


class ProviderPayoutAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderPayoutAccount
        fields = [
            'id', 'preferred_method', 'bkash_wallet_number', 'bank_name',
            'branch_name', 'routing_number', 'account_number',
            'account_holder_name', 'is_verified', 'hold_payouts', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'hold_payouts', 'updated_at']

    def validate(self, attrs):
        method = attrs.get('preferred_method') or getattr(self.instance, 'preferred_method', None)
        
        if method == PayoutMethod.BKASH:
            wallet = attrs.get('bkash_wallet_number')
            if not wallet:
                raise serializers.ValidationError({"bkash_wallet_number": "bKash wallet number is required."})
            cleaned = re.sub(r"[^\d+]", "", wallet)
            if not re.match(r"^(?:\+?880|0)?(1[3-9]\d{8})$", cleaned):
                raise serializers.ValidationError({"bkash_wallet_number": "Invalid Bangladeshi mobile number."})
        elif method == PayoutMethod.BANK_TRANSFER:
            routing = attrs.get('routing_number')
            if not routing or not re.match(r"^\d{9}$", routing):
                raise serializers.ValidationError({"routing_number": "Bank routing number must be 9 digits."})
            for field in ['bank_name', 'branch_name', 'account_number', 'account_holder_name']:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: f"{field.replace('_', ' ').capitalize()} is required."})
        return attrs


class RequestPayoutAccountChangeResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    expires_in_seconds = serializers.IntegerField()
    masked_phone = serializers.CharField()


class ConfirmPayoutAccountChangeRequestSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6, min_length=4)


class ConfirmPayoutAccountChangeResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    data = ProviderPayoutAccountSerializer()
