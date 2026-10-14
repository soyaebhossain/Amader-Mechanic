from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import ProviderProfile
from apps.accounts.serializers import UserSerializer

class ProviderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'provider_type', 'verification_status',
            'is_online', 'latitude', 'longitude', 'service_radius_km', 'rating'
        ]
        read_only_fields = ['id', 'rating', 'verification_status']

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_latitude(self, obj):
        if obj.current_location:
            return obj.current_location.y
        return None

    @extend_schema_field(serializers.FloatField(allow_null=True))
    def get_longitude(self, obj):
        if obj.current_location:
            return obj.current_location.x
        return None
