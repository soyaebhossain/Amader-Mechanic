import pytest
import concurrent.futures
from datetime import timedelta
from django.utils import timezone
from django.contrib.gis.geos import Point
from apps.accounts.models import User
from apps.providers.models import ProviderProfile
from apps.service_requests.models import ServiceRequest
from apps.dispatch.models import DispatchOffer
from apps.dispatch.services.dispatch_service import DispatchService, DispatchConcurrencyError

@pytest.mark.django_db(transaction=True)
def test_single_winner_in_dispatch_offer_acceptance():
    customer = User.objects.create(phone_number="+8801700000001", full_name="Customer 1")
    service_request = ServiceRequest.objects.create(
        customer=customer,
        status='matching',
        pickup_location=Point(90.4125, 23.8103, srid=4326),
        pickup_address="Gulshan 2, Dhaka"
    )

    user_a = User.objects.create(phone_number="+8801800000001", full_name="Mechanic A")
    provider_a = ProviderProfile.objects.create(user=user_a, provider_type="mechanic", verification_status="verified", is_online=True)

    user_b = User.objects.create(phone_number="+8801800000002", full_name="Mechanic B")
    provider_b = ProviderProfile.objects.create(user=user_b, provider_type="mechanic", verification_status="verified", is_online=True)

    offer_a = DispatchService.create_offer(service_request, provider_a, timeout_seconds=60)
    offer_b = DispatchService.create_offer(service_request, provider_b, timeout_seconds=60)

    # Provider A accepts first
    accepted = DispatchService.accept_offer(offer_a.id, provider=provider_a)
    assert accepted.status == 'accepted'

    # Provider B attempts to accept after already assigned
    with pytest.raises(DispatchConcurrencyError) as exc_info:
        DispatchService.accept_offer(offer_b.id, provider=provider_b)
    assert "already assigned" in str(exc_info.value) or "already in state" in str(exc_info.value)

    # Validate state of service request
    service_request.refresh_from_db()
    assert service_request.assigned_provider == provider_a
    assert service_request.status == 'assigned'

    # Validate status events logged
    events = list(service_request.status_events.all())
    assert any(e.to_status == 'assigned' for e in events)

@pytest.mark.django_db(transaction=True)
def test_expired_offer_rejection():
    customer = User.objects.create(phone_number="+8801700000002", full_name="Customer 2")
    service_request = ServiceRequest.objects.create(
        customer=customer,
        status='matching',
        pickup_location=Point(90.4125, 23.8103, srid=4326),
        pickup_address="Dhanmondi 32, Dhaka"
    )

    user = User.objects.create(phone_number="+8801800000003", full_name="Mechanic C")
    provider = ProviderProfile.objects.create(user=user, provider_type="mechanic", verification_status="verified", is_online=True)

    # Create offer already expired
    offer = DispatchOffer.objects.create(
        service_request=service_request,
        provider=provider,
        status='offered',
        expires_at=timezone.now() - timedelta(seconds=10)
    )

    with pytest.raises(DispatchConcurrencyError) as exc_info:
        DispatchService.accept_offer(offer.id, provider=provider)
    assert "expired" in str(exc_info.value)

    offer.refresh_from_db()
    assert offer.status == 'expired'
