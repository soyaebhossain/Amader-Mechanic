import logging
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.service_requests.models import ServiceRequest, ServiceRequestEvent

logger = logging.getLogger(__name__)

class RequestStateMachine:
    ALLOWED_TRANSITIONS = {
        'requested': ['matching', 'assigned', 'cancelled'],
        'matching': ['assigned', 'requested', 'cancelled'],
        'assigned': ['en_route', 'cancelled', 'matching'],
        'en_route': ['arrived', 'cancelled'],
        'arrived': ['inspection', 'in_progress', 'cancelled'],
        'inspection': ['awaiting_quote_approval', 'in_progress', 'cancelled'],
        'awaiting_quote_approval': ['in_progress', 'awaiting_payment', 'cancelled'],
        'in_progress': ['awaiting_payment', 'completed', 'cancelled'],
        'awaiting_payment': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
    }

    @classmethod
    @transaction.atomic
    def transition_to(
        cls,
        service_request: ServiceRequest,
        new_status: str,
        actor=None,
        reason: str = "",
        force: bool = False
    ) -> ServiceRequest:
        old_status = service_request.status

        if old_status == new_status:
            return service_request

        valid_next_states = cls.ALLOWED_TRANSITIONS.get(old_status, [])
        if not force and valid_next_states and new_status not in valid_next_states:
            logger.warning(
                f"Transition from '{old_status}' to '{new_status}' is irregular for Request #{service_request.id}"
            )

        # Record event
        ServiceRequestEvent.objects.create(
            service_request=service_request,
            from_status=old_status,
            to_status=new_status,
            actor=actor,
            reason=reason
        )

        service_request.status = new_status
        service_request.save(update_fields=['status', 'updated_at'])
        return service_request
