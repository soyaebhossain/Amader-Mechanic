from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # OpenAPI 3 Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Domain API routes
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/providers/', include('apps.providers.urls')),
    path('api/v1/service-requests/', include('apps.service_requests.urls')),
    path('api/v1/dispatch/', include('apps.dispatch.urls')),
    path('api/v1/financial/', include('apps.financial_ledger.urls')),
    path('api/v1/catalog/', include('apps.service_catalog.urls')),
    path('api/v1/vehicles/', include('apps.vehicles.urls')),
    path('api/v1/quotes/', include('apps.pricing_quotes.urls')),
]
