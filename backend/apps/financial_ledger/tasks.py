import logging
from celery import shared_task
from django.db import transaction
from django.utils import timezone
from .models import PayoutBatch, PayoutItem, PayoutMethod, PayoutStatus, PayoutItemStatus
from .gateways.disbursement import BkashB2CDisbursementClient
from .services.settlement import PayoutSettlementService
from apps.notifications.tasks import send_transactional_sms_task

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=2)
def execute_bkash_payout_item(self, item_id: str = None, *args, **kwargs):
    """Processes an individual bKash wallet disbursement within a batch."""
    # Gracefully handle both direct functional call and Celery bound execution
    if item_id is None and isinstance(self, str):
        item_id = self
        self = None

    try:
        item = PayoutItem.objects.select_related('provider__user').get(id=item_id)
        if item.status == PayoutItemStatus.PAID:
            return f"Item {item_id} already paid."

        client = BkashB2CDisbursementClient()
        result = client.transfer_to_wallet(
            recipient_msisdn=item.destination_target,
            amount=item.amount,
            payout_item_id=str(item.id)
        )

        if result.get("is_success"):
            PayoutSettlementService.mark_item_successful(
                item=item,
                trx_id=result["trx_id"],
                raw_response=result["raw"]
            )
            # Notify provider via SMS
            try:
                send_transactional_sms_task.delay(
                    phone=item.destination_target,
                    message=f"আমাদের মেকানিক: আপনার একাউন্টে ৳{item.amount:.2f} পেআউট পাঠানো হয়েছে (TrxID: {result['trx_id']})।",
                    template_key="PAYOUT_DISBURSED",
                    user_id=str(item.provider.user.id)
                )
            except Exception as sms_err:
                logger.error(f"Failed to trigger SMS notification for payout item {item_id}: {sms_err}")

            return f"Payout {item_id} succeeded with TrxID {result['trx_id']}"
        else:
            item.status = PayoutItemStatus.FAILED
            item.failure_reason = result.get("error_message")
            item.gateway_response = result.get("raw", {})
            item.save(update_fields=['status', 'failure_reason', 'gateway_response'])
            return f"Payout {item_id} failed: {item.failure_reason}"

    except Exception as exc:
        logger.error(f"Error executing payout item {item_id}: {str(exc)}")
        if self and hasattr(self, 'retry'):
            raise self.retry(exc=exc, countdown=30)
        raise exc


@shared_task
def run_monthly_disbursement_pipeline():
    """
    Periodic master job: Aggregates balances, creates batches, 
    and triggers individual disbursement jobs.
    """
    logger.info("Starting automated settlement pipeline.")

    # 1. Aggregate and dispatch bKash payouts
    bkash_batch = PayoutSettlementService.aggregate_and_create_batch(payout_method=PayoutMethod.BKASH)
    if bkash_batch.total_providers > 0:
        bkash_batch.status = PayoutStatus.PROCESSING
        bkash_batch.executed_at = timezone.now()
        bkash_batch.save(update_fields=['status', 'executed_at'])

        for item in bkash_batch.items.filter(status=PayoutItemStatus.QUEUED):
            execute_bkash_payout_item.delay(str(item.id))

    # 2. Aggregate Bank BEFTN batch (Ready for manual admin authorization or STP portal export)
    bank_batch = PayoutSettlementService.aggregate_and_create_batch(payout_method=PayoutMethod.BANK_TRANSFER)
    if bank_batch.total_providers > 0:
        bank_batch.status = PayoutStatus.PROCESSING
        bank_batch.save(update_fields=['status'])
        logger.info(f"Generated BEFTN Bank Batch #{bank_batch.batch_reference} for ৳{bank_batch.total_amount}")

    return "Payout aggregation cycle completed."
