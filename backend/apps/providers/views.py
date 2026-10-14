from rest_framework import generics, permissions
from .models import ProviderProfile
from .serializers import ProviderProfileSerializer

class ProviderProfileMeView(generics.RetrieveUpdateAPIView):
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = ProviderProfile.objects.get_or_create(user=self.request.user)
        return profile

class ProviderListView(generics.ListAPIView):
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ProviderProfile.objects.filter(verification_status='verified', is_online=True)
