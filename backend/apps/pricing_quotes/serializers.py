from rest_framework import serializers
from .models import ServiceQuote

class ServiceQuoteSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.user.get_full_name', read_only=True)
    provider_phone = serializers.CharField(source='provider.user.phone_number', read_only=True)

    class Meta:
        model = ServiceQuote
        fields = [
            'id',
            'service_request',
            'provider',
            'provider_name',
            'provider_phone',
            'estimated_labor_cost',
            'estimated_parts_cost',
            'total_amount',
            'breakdown_notes',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']
