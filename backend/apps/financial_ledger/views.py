from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from drf_spectacular.utils import extend_schema
from .models import ProviderPayoutAccount
from .serializers import (
    ProviderPayoutAccountSerializer,
    RequestPayoutAccountChangeResponseSerializer,
    ConfirmPayoutAccountChangeRequestSerializer,
    ConfirmPayoutAccountChangeResponseSerializer,
)
from .services.payout_otp import PayoutOTPService


class ProviderPayoutAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProviderPayoutAccountSerializer

    @extend_schema(
        responses={200: ProviderPayoutAccountSerializer},
        summary="Retrieve authenticated provider payout account"
    )
    def get(self, request):
        provider = getattr(request.user, 'provider_profile', None)
        if not provider:
            return Response({"detail": "User is not a verified provider."}, status=status.HTTP_403_FORBIDDEN)
        account, _ = ProviderPayoutAccount.objects.get_or_create(provider=provider)
        serializer = ProviderPayoutAccountSerializer(account)
        return Response(serializer.data)

    @extend_schema(
        request=ProviderPayoutAccountSerializer,
        responses={200: ProviderPayoutAccountSerializer},
        summary="Update authenticated provider payout account"
    )
    def put(self, request):
        provider = getattr(request.user, 'provider_profile', None)
        if not provider:
            return Response({"detail": "User is not a verified provider."}, status=status.HTTP_403_FORBIDDEN)
        account, _ = ProviderPayoutAccount.objects.get_or_create(provider=provider)
        serializer = ProviderPayoutAccountSerializer(account, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RequestPayoutAccountChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProviderPayoutAccountSerializer

    @extend_schema(
        request=ProviderPayoutAccountSerializer,
        responses={
            200: RequestPayoutAccountChangeResponseSerializer,
            429: dict
        },
        summary="Request 6-digit OTP to change payout account destination"
    )
    def post(self, request):
        provider = getattr(request.user, 'provider_profile', None)
        if not provider:
            return Response({"detail": "Only verified providers can modify payout settings."}, status=status.HTTP_403_FORBIDDEN)

        # 1. Validate payload format prior to generating OTP
        account, _ = ProviderPayoutAccount.objects.get_or_create(provider=provider)
        serializer = ProviderPayoutAccountSerializer(account, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            # 2. Stage in Redis and trigger SMS
            result = PayoutOTPService.initiate_payout_change(
                provider=provider,
                pending_payload=serializer.validated_data
            )
            return Response({
                "message": f"{result['masked_phone']} নম্বরে ৬-সংখ্যার ওটিপি পাঠানো হয়েছে।",
                "expires_in_seconds": result["expires_in_seconds"],
                "masked_phone": result["masked_phone"]
            }, status=status.HTTP_200_OK)
        except ValueError as err:
            return Response({"detail": str(err)}, status=status.HTTP_429_TOO_MANY_REQUESTS)


class ConfirmPayoutAccountChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConfirmPayoutAccountChangeRequestSerializer

    @extend_schema(
        request=ConfirmPayoutAccountChangeRequestSerializer,
        responses={
            200: ConfirmPayoutAccountChangeResponseSerializer,
            400: dict
        },
        summary="Confirm and commit payout account modification with OTP"
    )
    def post(self, request):
        provider = getattr(request.user, 'provider_profile', None)
        if not provider:
            return Response({"detail": "Unauthorized."}, status=status.HTTP_403_FORBIDDEN)

        otp_code = request.data.get("otp")
        if not otp_code:
            return Response({"detail": "ওটিপি কোড প্রদান করা আবশ্যক।"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify OTP against staged Redis state
            staged_payload = PayoutOTPService.verify_and_commit_change(
                provider=provider,
                submitted_otp=str(otp_code)
            )

            # 2. Persist to PostgreSQL atomically
            with transaction.atomic():
                account, _ = ProviderPayoutAccount.objects.select_for_update().get_or_create(provider=provider)
                serializer = ProviderPayoutAccountSerializer(account, data=staged_payload, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()

            return Response({
                "message": "উত্তোলন অ্যাকাউন্টের তথ্য সফলভাবে হালনাগাদ করা হয়েছে।",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except ValueError as err:
            return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)
