from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceItemViewSet

router = DefaultRouter()
router.register(r'services', ServiceItemViewSet, basename='service-item')

urlpatterns = [
    path('', include(router.urls)),
]
