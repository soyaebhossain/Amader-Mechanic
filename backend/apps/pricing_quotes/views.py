from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ServiceQuote
from .serializers import ServiceQuoteSerializer
from apps.service_requests.services.state_machine import RequestStateMachine

class ServiceQuoteViewSet(viewsets.ModelViewSet):
    """API for managing diagnostic quotes and customer approvals."""
    queryset = ServiceQuote.objects.all().order_by('-created_at')
    serializer_class = ServiceQuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'provider_profile'):
            return self.queryset.filter(provider=user.provider_profile)
        # For customers, show quotes for their service requests
        return self.queryset.filter(service_request__customer=user)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        quote = self.get_object()
        if quote.status == 'approved':
            return Response({'detail': 'Quote is already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        quote.status = 'approved'
        quote.save(update_fields=['status'])

        # Advance state machine of the linked service request
        try:
            RequestStateMachine.transition_to(
                service_request=quote.service_request,
                new_status='in_progress',
                actor=request.user,
                reason=f"Customer approved quote {quote.id} for BDT {quote.total_amount}"
            )
        except Exception as e:
            pass # State machine transition logged

        return Response({
            'detail': 'Quote approved successfully. Mechanic may proceed with service.',
            'quote_id': str(quote.id),
            'status': quote.status,
            'total_amount': str(quote.total_amount)
        })

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        quote = self.get_object()
        quote.status = 'rejected'
        quote.save(update_fields=['status'])

        return Response({
            'detail': 'Quote has been rejected.',
            'quote_id': str(quote.id),
            'status': quote.status
        })
