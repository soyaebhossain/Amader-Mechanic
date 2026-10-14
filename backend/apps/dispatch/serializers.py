from rest_framework import serializers
from .models import DispatchOffer
from apps.service_requests.serializers import ServiceRequestSerializer

class DispatchOfferSerializer(serializers.ModelSerializer):
    service_request = ServiceRequestSerializer(read_only=True)

    class Meta:
        model = DispatchOffer
        fields = ['id', 'service_request', 'provider', 'status', 'offered_at', 'expires_at']
        read_only_fields = ['id', 'offered_at']
