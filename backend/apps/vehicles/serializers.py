from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'owner', 'license_plate', 'vehicle_type', 'make', 'model', 'year', 'color', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def validate_license_plate(self, value):
        # Clean license plate formatting
        return value.strip().upper()
