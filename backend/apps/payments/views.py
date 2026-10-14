from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import PaymentIntent, PaymentStatus, WebhookDeliveryAudit, PaymentProvider
from .serializers import (
    PaymentIntentSerializer,
    InitiateCheckoutRequestSerializer,
    InitiateCheckoutResponseSerializer
)
from .gateways.bkash import BkashTokenizedGateway
from .gateways.sslcommerz import SSLCommerzGateway
from .gateways.nagad import NagadGateway
from .services.processor import PaymentProcessorService

class InitiateCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=InitiateCheckoutRequestSerializer,
        responses={200: InitiateCheckoutResponseSerializer},
        summary="Initiate payment checkout session (bKash, SSLCommerz, Nagad)"
    )
    def post(self, request):
        intent_id = request.data.get("payment_intent_id")
        provider_name = request.data.get("provider", PaymentProvider.BKASH)
        callback_url = request.data.get("callback_url")

        try:
            payment_intent = PaymentIntent.objects.get(id=intent_id, customer=request.user)
        except PaymentIntent.DoesNotExist:
            return Response({"error": "Payment intent not found"}, status=status.HTTP_404_NOT_FOUND)

        customer_payload = {
            "phone": request.user.phone_number,
            "full_name": request.user.full_name,
            "email": getattr(request.user, 'email', None)
        }

        if provider_name == PaymentProvider.BKASH:
            gateway = BkashTokenizedGateway()
        elif provider_name == PaymentProvider.SSLCOMMERZ:
            gateway = SSLCommerzGateway()
        elif provider_name == PaymentProvider.NAGAD:
            gateway = NagadGateway()
        else:
            return Response({"error": "Unsupported gateway"}, status=status.HTTP_400_BAD_REQUEST)

        checkout_data = gateway.create_checkout_session(
            payment_intent_id=str(payment_intent.id),
            amount=payment_intent.amount,
            currency=payment_intent.currency,
            customer_info=customer_payload,
            callback_url=callback_url
        )

        payment_intent.provider = provider_name
        payment_intent.gateway_reference = checkout_data.get("payment_id") or str(payment_intent.id)
        payment_intent.status = PaymentStatus.INITIATED
        payment_intent.save(update_fields=['provider', 'gateway_reference', 'status'])

        return Response(checkout_data, status=status.HTTP_200_OK)


class BkashCallbackWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=None,
        responses={200: serializers.DictField()},
        parameters=[
            OpenApiParameter('paymentID', str, description='bKash Payment ID'),
            OpenApiParameter('status', str, description='Transaction status'),
        ],
        summary="bKash tokenized gateway redirect callback"
    )
    def get(self, request):
        """bKash passes query params on redirect: paymentID, status, api_key."""
        payment_id = request.query_params.get("paymentID")
        cb_status = request.query_params.get("status")

        if cb_status != "success":
            return Response({"status": "Failed or Cancelled by customer"}, status=status.HTTP_400_BAD_REQUEST)

        # Idempotency lock via audit log
        audit, created = WebhookDeliveryAudit.objects.get_or_create(
            provider=PaymentProvider.BKASH,
            event_id=f"bkash_{payment_id}",
            defaults={"raw_payload": request.query_params.dict()}
        )
        if not created and audit.processed:
            return Response({"status": "Already processed"}, status=status.HTTP_200_OK)

        try:
            payment_intent = PaymentIntent.objects.get(gateway_reference=payment_id)
        except PaymentIntent.DoesNotExist:
            return Response({"error": "Unknown payment reference"}, status=status.HTTP_404_NOT_FOUND)

        gateway = BkashTokenizedGateway()
        verification = gateway.verify_and_capture_transaction({"paymentID": payment_id})

        if verification["is_successful"]:
            PaymentProcessorService.process_successful_payment(
                payment_intent=payment_intent,
                txn_id=verification["transaction_id"],
                verified_amount=verification["amount"],
                meta=verification["raw"]
            )
            audit.processed = True
            audit.processed_at = timezone.now()
            audit.save(update_fields=['processed', 'processed_at'])
            return Response({"status": "Verified and Complete"}, status=status.HTTP_200_OK)

        return Response({"status": "Verification Failed"}, status=status.HTTP_400_BAD_REQUEST)


class SSLCommerzIPNWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=None,
        responses={200: serializers.DictField()},
        summary="SSLCommerz IPN webhook notification"
    )
    def post(self, request):
        tran_id = request.data.get("tran_id")
        val_id = request.data.get("val_id")

        if not tran_id or not val_id:
            return Response({"error": "Malformed payload"}, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate delivery
        audit, created = WebhookDeliveryAudit.objects.get_or_create(
            provider=PaymentProvider.SSLCOMMERZ,
            event_id=f"ssl_{val_id}",
            defaults={"raw_payload": request.data.dict()}
        )
        if not created and audit.processed:
            return Response({"status": "IPN already handled"}, status=status.HTTP_200_OK)

        try:
            payment_intent = PaymentIntent.objects.get(id=tran_id)
        except PaymentIntent.DoesNotExist:
            return Response({"error": "Unknown payment intent"}, status=status.HTTP_404_NOT_FOUND)

        gateway = SSLCommerzGateway()
        verification = gateway.verify_and_capture_transaction({"val_id": val_id})

        if verification["is_successful"]:
            PaymentProcessorService.process_successful_payment(
                payment_intent=payment_intent,
                txn_id=verification["transaction_id"],
                verified_amount=verification["amount"],
                meta=verification["raw"]
            )
            audit.processed = True
            audit.processed_at = timezone.now()
            audit.save(update_fields=['processed', 'processed_at'])
            return Response({"status": "IPN processed successfully"}, status=status.HTTP_200_OK)

        return Response({"error": "Validation query declined"}, status=status.HTTP_400_BAD_REQUEST)


class NagadCallbackWebhookView(APIView):
    """
    Nagad invokes this endpoint on transaction completion or failure:
    GET /api/v1/payments/webhooks/nagad/?payment_ref_id=...&status=...
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=None,
        responses={200: serializers.DictField()},
        parameters=[
            OpenApiParameter('payment_ref_id', str, description='Nagad Payment Reference ID'),
            OpenApiParameter('status', str, description='Transaction status (e.g. Success, Failed)'),
        ],
        summary="Nagad PGW redirect callback"
    )
    def get(self, request):
        payment_ref_id = request.query_params.get("payment_ref_id")
        cb_status = request.query_params.get("status")

        if not payment_ref_id:
            return Response({"error": "Missing payment_ref_id"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check if user cancelled or failed at gateway
        if cb_status != "Success":
            PaymentIntent.objects.filter(
                gateway_reference=payment_ref_id,
                status=PaymentStatus.INITIATED
            ).update(status=PaymentStatus.FAILED)
            return Response({"status": f"Transaction aborted with status: {cb_status}"}, status=status.HTTP_200_OK)

        # 2. Idempotency Check via Webhook Delivery Audit
        audit, created = WebhookDeliveryAudit.objects.get_or_create(
            provider=PaymentProvider.NAGAD,
            event_id=f"nagad_{payment_ref_id}",
            defaults={"raw_payload": request.query_params.dict()}
        )
        if not created and audit.processed:
            return Response({"status": "Payment already processed"}, status=status.HTTP_200_OK)

        # 3. Locate Target Payment Intent
        try:
            payment_intent = PaymentIntent.objects.get(gateway_reference=payment_ref_id)
        except PaymentIntent.DoesNotExist:
            return Response({"error": "Unknown payment reference"}, status=status.HTTP_404_NOT_FOUND)

        # 4. Execute Server-to-Server Verification (Never trust browser parameters alone)
        gateway = NagadGateway()
        verification = gateway.verify_and_capture_transaction({"payment_ref_id": payment_ref_id})

        if verification["is_successful"]:
            PaymentProcessorService.process_successful_payment(
                payment_intent=payment_intent,
                txn_id=verification["transaction_id"],
                verified_amount=verification["amount"],
                meta=verification["raw"]
            )
            audit.processed = True
            audit.processed_at = timezone.now()
            audit.save(update_fields=['processed', 'processed_at'])
            return Response({"status": "Payment verified and completed"}, status=status.HTTP_200_OK)

        return Response({"error": verification.get("error_message")}, status=status.HTTP_400_BAD_REQUEST)
