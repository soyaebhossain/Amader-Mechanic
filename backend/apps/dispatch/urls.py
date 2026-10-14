from django.urls import path
from .views import DispatchOfferListView, DispatchOfferAcceptView

urlpatterns = [
    path('offers/', DispatchOfferListView.as_view(), name='dispatch-offers-list'),
    path('offers/<uuid:pk>/accept/', DispatchOfferAcceptView.as_view(), name='dispatch-offer-accept'),
]
