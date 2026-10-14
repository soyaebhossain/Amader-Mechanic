from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'full_name', 'email', 'preferred_language', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
