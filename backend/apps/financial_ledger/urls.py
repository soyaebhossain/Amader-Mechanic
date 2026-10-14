from django.urls import path
from .views import (
    ProviderPayoutAccountView,
    RequestPayoutAccountChangeView,
    ConfirmPayoutAccountChangeView
)

urlpatterns = [
    path('provider/payout-account/', ProviderPayoutAccountView.as_view(), name='provider-payout-account'),
    path('provider/payout-account/request-change/', RequestPayoutAccountChangeView.as_view(), name='payout-account-request-change'),
    path('provider/payout-account/confirm-change/', ConfirmPayoutAccountChangeView.as_view(), name='payout-account-confirm-change'),
]
