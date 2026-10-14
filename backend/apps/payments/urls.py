from django.urls import path
from .views import (
    InitiateCheckoutView,
    BkashCallbackWebhookView,
    SSLCommerzIPNWebhookView,
    NagadCallbackWebhookView
)

urlpatterns = [
    path('checkout/initiate/', InitiateCheckoutView.as_view(), name='checkout-initiate'),
    path('webhooks/bkash/', BkashCallbackWebhookView.as_view(), name='webhook-bkash'),
    path('webhooks/sslcommerz/', SSLCommerzIPNWebhookView.as_view(), name='webhook-sslcommerz'),
    path('webhooks/nagad/', NagadCallbackWebhookView.as_view(), name='webhook-nagad'),
]
