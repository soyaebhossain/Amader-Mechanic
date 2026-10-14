from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceQuoteViewSet

router = DefaultRouter()
router.register(r'', ServiceQuoteViewSet, basename='service-quote')

urlpatterns = [
    path('', include(router.urls)),
]
