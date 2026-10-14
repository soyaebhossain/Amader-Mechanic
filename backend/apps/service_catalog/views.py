from rest_framework import viewsets, permissions
from .models import ServiceItem
from .serializers import ServiceItemSerializer

class ServiceItemViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint allowing clients to browse active emergency assistance catalog services."""
    queryset = ServiceItem.objects.filter(is_active=True).order_by('name')
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.AllowAny]
