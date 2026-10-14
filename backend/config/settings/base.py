import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'antigravity-dev-secret-key-bd-880')
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 't')
ALLOWED_HOSTS = ['*']

AUTH_USER_MODEL = 'accounts.User'

# Auto-detect Windows GDAL and GEOS if present (e.g. from bundled wheels or OSGeo4W)
if os.name == 'nt':
    try:
        import sys
        # Check venv site-packages fiona.libs or shapely.libs
        site_packages = Path(sys.prefix) / 'Lib' / 'site-packages'
        fiona_libs = site_packages / 'fiona.libs'
        if fiona_libs.exists():
            os.add_dll_directory(str(fiona_libs))
            gdal_candidates = list(fiona_libs.glob('gdal*.dll'))
            if gdal_candidates:
                GDAL_LIBRARY_PATH = str(gdal_candidates[0])
            geos_candidates = list(fiona_libs.glob('geos_c*.dll'))
            if geos_candidates:
                GEOS_LIBRARY_PATH = str(geos_candidates[0])
    except Exception:
        pass

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',  # PostGIS Support
    'rest_framework',
    'drf_spectacular',
    
    # Local domain apps
    'apps.accounts',
    'apps.roles_permissions',
    'apps.vehicles',
    'apps.service_catalog',
    'apps.providers',
    'apps.service_requests',
    'apps.dispatch',
    'apps.pricing_quotes',
    'apps.payments',
    'apps.financial_ledger',
    'apps.notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.contrib.gis.db.backends.postgis'),
        'NAME': os.environ.get('POSTGRES_DB', 'roadside_assistance_bd'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'antigravity_secret_password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Roadside Assistance BD API',
    'DESCRIPTION': 'Modular Monolith API for roadside breakdown recovery in Bangladesh',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

LANGUAGE_CODE = 'bn-bd'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Cache Configuration
if os.environ.get('USE_REDIS_CACHE', 'False').lower() in ('true', '1'):
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'roadside-dev-cache',
        }
    }

# General API Base
BACKEND_API_BASE_URL = os.environ.get('BACKEND_API_BASE_URL', 'http://localhost:8000')

# bKash Gateway Settings
BKASH_BASE_URL = os.environ.get('BKASH_BASE_URL', 'https://tokenized.sandbox.bka.sh/v1.2.0-beta')
BKASH_APP_KEY = os.environ.get('BKASH_APP_KEY', 'sandbox_app_key_placeholder')
BKASH_APP_SECRET = os.environ.get('BKASH_APP_SECRET', 'sandbox_app_secret_placeholder')
BKASH_USERNAME = os.environ.get('BKASH_USERNAME', 'sandbox_user')
BKASH_PASSWORD = os.environ.get('BKASH_PASSWORD', 'sandbox_pass')

# SSLCommerz Gateway Settings
SSLCOMMERZ_STORE_ID = os.environ.get('SSLCOMMERZ_STORE_ID', 'testbox')
SSLCOMMERZ_STORE_PASSWORD = os.environ.get('SSLCOMMERZ_STORE_PASSWORD', 'testbox@ssl')
SSLCOMMERZ_IS_SANDBOX = os.environ.get('SSLCOMMERZ_IS_SANDBOX', 'True').lower() in ('true', '1', 't')

# Nagad Gateway Settings
NAGAD_MERCHANT_ID = os.environ.get("NAGAD_MERCHANT_ID", "683002007104225")
NAGAD_BASE_URL = os.environ.get("NAGAD_BASE_URL", "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0")
NAGAD_SERVER_IP = os.environ.get("NAGAD_SERVER_IP", "103.100.102.1")
NAGAD_MERCHANT_PRIVATE_KEY = os.environ.get(
    "NAGAD_MERCHANT_PRIVATE_KEY",
    "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...\n-----END RSA PRIVATE KEY-----"
)
NAGAD_PGW_PUBLIC_KEY = os.environ.get(
    "NAGAD_PGW_PUBLIC_KEY",
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----"
)

# SMS Gateway Configurations
ACTIVE_SMS_GATEWAY = os.environ.get('ACTIVE_SMS_GATEWAY', 'GREENWEB')
GREENWEB_SMS_TOKEN = os.environ.get('GREENWEB_SMS_TOKEN', 'mock_greenweb_token')
BULKSMSBD_API_KEY = os.environ.get('BULKSMSBD_API_KEY', 'mock_bulksmsbd_key')
BULKSMSBD_SENDER_ID = os.environ.get('BULKSMSBD_SENDER_ID', 'AmaderMech')

# Celery task execution mode (always eager in dev/tests if worker is not running)
CELERY_TASK_ALWAYS_EAGER = os.environ.get('CELERY_ALWAYS_EAGER', 'True').lower() in ('true', '1')

# bKash B2C Disbursement Settings
BKASH_B2C_BASE_URL = os.environ.get('BKASH_B2C_BASE_URL', 'https://b2c.sandbox.bka.sh/v1.0')
BKASH_B2C_USERNAME = os.environ.get('BKASH_B2C_USERNAME', 'sandbox_b2c_user')
BKASH_B2C_PASSWORD = os.environ.get('BKASH_B2C_PASSWORD', 'sandbox_b2c_pass')
BKASH_B2C_APP_KEY = os.environ.get('BKASH_B2C_APP_KEY', 'sandbox_b2c_app_key')
BKASH_B2C_APP_SECRET = os.environ.get('BKASH_B2C_APP_SECRET', 'sandbox_b2c_app_secret')
