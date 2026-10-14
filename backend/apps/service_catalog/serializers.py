from rest_framework import serializers
from .models import ServiceItem

class ServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceItem
        fields = ['id', 'name', 'code', 'description', 'base_price', 'is_active']
