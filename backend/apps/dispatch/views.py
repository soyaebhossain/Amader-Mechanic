from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from .models import DispatchOffer
from .serializers import DispatchOfferSerializer
from .services.dispatch_service import DispatchService, DispatchConcurrencyError

class DispatchOfferListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: DispatchOfferSerializer(many=True)},
        summary="List active dispatch offers for the logged in mechanic/provider"
    )
    def get(self, request):
        if hasattr(request.user, 'provider_profile'):
            offers = DispatchOffer.objects.filter(provider=request.user.provider_profile, status='offered')
            serializer = DispatchOfferSerializer(offers, many=True)
            return Response(serializer.data)
        return Response({"detail": "User is not a registered provider"}, status=status.HTTP_403_FORBIDDEN)

class DispatchOfferAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={200: DispatchOfferSerializer},
        summary="Accept a dispatch offer (concurrency-safe single winner lock)"
    )
    def post(self, request, pk):
        if not hasattr(request.user, 'provider_profile'):
            return Response({"error": "Only providers can accept offers"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            offer = DispatchService.accept_offer(offer_id=pk, provider=request.user.provider_profile)
            serializer = DispatchOfferSerializer(offer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DispatchConcurrencyError as e:
            return Response({"error": str(e)}, status=status.HTTP_409_CONFLICT)
