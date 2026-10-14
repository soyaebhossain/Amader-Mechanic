import logging
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from apps.dispatch.models import DispatchOffer
from apps.service_requests.models import ServiceRequest
from apps.service_requests.services.state_machine import RequestStateMachine

logger = logging.getLogger(__name__)

class DispatchConcurrencyError(Exception):
    """Raised when concurrent operations conflict on dispatch offers."""
    pass

class DispatchService:
    DEFAULT_TIMEOUT_SECONDS = 60

    @classmethod
    def create_offer(cls, service_request: ServiceRequest, provider, timeout_seconds: int = None) -> DispatchOffer:
        if timeout_seconds is None:
            timeout_seconds = cls.DEFAULT_TIMEOUT_SECONDS
        expires_at = timezone.now() + timedelta(seconds=timeout_seconds)
        offer, created = DispatchOffer.objects.get_or_create(
            service_request=service_request,
            provider=provider,
            defaults={'expires_at': expires_at, 'status': 'offered'}
        )
        if not created:
            offer.status = 'offered'
            offer.expires_at = expires_at
            offer.save(update_fields=['status', 'expires_at'])
        return offer

    @classmethod
    @transaction.atomic
    def accept_offer(cls, offer_id, provider=None) -> DispatchOffer:
        # Select offer with row lock
        try:
            offer = DispatchOffer.objects.select_for_update().get(id=offer_id)
        except DispatchOffer.DoesNotExist:
            raise DispatchConcurrencyError("Offer does not exist")

        if provider and offer.provider_id != provider.id:
            raise DispatchConcurrencyError("Provider does not match offer recipient")

        # Expiry check
        if timezone.now() > offer.expires_at:
            offer.status = 'expired'
            offer.save(update_fields=['status'])
            raise DispatchConcurrencyError("Offer has expired")

        if offer.status != 'offered':
            raise DispatchConcurrencyError(f"Offer is already in state '{offer.status}'")

        # Lock service request row to prevent concurrent assignment
        service_request = ServiceRequest.objects.select_for_update().get(id=offer.service_request_id)

        if service_request.assigned_provider is not None:
            offer.status = 'rejected'
            offer.save(update_fields=['status'])
            raise DispatchConcurrencyError("Service request is already assigned to another provider")

        if service_request.status not in ['requested', 'matching']:
            offer.status = 'rejected'
            offer.save(update_fields=['status'])
            raise DispatchConcurrencyError(f"Service request cannot be accepted in state '{service_request.status}'")

        # Mark offer as accepted
        offer.status = 'accepted'
        offer.save(update_fields=['status'])

        # Expire all competing offers
        DispatchOffer.objects.filter(
            service_request=service_request,
            status='offered'
        ).exclude(id=offer.id).update(status='expired')

        # Assign provider and transition state
        service_request.assigned_provider = offer.provider
        service_request.save(update_fields=['assigned_provider', 'updated_at'])

        RequestStateMachine.transition_to(
            service_request=service_request,
            new_status='assigned',
            actor=offer.provider.user,
            reason=f"Offer accepted by provider {offer.provider.user.phone_number}"
        )

        return offer
