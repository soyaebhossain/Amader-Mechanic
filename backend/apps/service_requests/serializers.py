from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import ServiceRequest, ServiceRequestEvent
from apps.accounts.serializers import UserSerializer
from apps.providers.serializers import ProviderProfileSerializer

class ServiceRequestEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequestEvent
        fields = ['id', 'from_status', 'to_status', 'reason', 'timestamp']

class ServiceRequestSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    assigned_provider = ProviderProfileSerializer(read_only=True)
    status_events = ServiceRequestEventSerializer(many=True, read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'customer', 'assigned_provider', 'status',
            'pickup_address', 'latitude', 'longitude', 'problem_description',
            'status_events', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_latitude(self, obj):
        if obj.pickup_location:
            return obj.pickup_location.y
        return None

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_longitude(self, obj):
        if obj.pickup_location:
            return obj.pickup_location.x
        return None
