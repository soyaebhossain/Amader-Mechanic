from django.urls import path
from .views import ProviderProfileMeView, ProviderListView

urlpatterns = [
    path('me/', ProviderProfileMeView.as_view(), name='provider-me'),
    path('active/', ProviderListView.as_view(), name='provider-active-list'),
]
