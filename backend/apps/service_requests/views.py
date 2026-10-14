from rest_framework import generics, permissions
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer

class ServiceRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ServiceRequest.objects.all()
        return ServiceRequest.objects.filter(customer=user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class ServiceRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ServiceRequest.objects.all()
