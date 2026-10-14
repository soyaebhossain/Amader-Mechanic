# Amader Mechanic (Roadside Assistance BD) 🇧🇩🚗🔧

A Modular Monolith Backend for real-time roadside vehicle breakdown recovery, mechanic dispatching, and multi-gateway digital payments (bKash, Nagad, SSLCommerz) across Bangladesh.

---

## 🏛 Architecture & Domain Apps

```
apps/backend/
├── config/                  # Django project configuration & settings
│   ├── settings/
│   │   ├── __init__.py
│   │   └── base.py          # PostGIS, Celery, Redis, PGW settings
│   ├── urls.py              # Root router & OpenAPI Swagger UI (/api/docs/)
│   ├── celery.py            # Async worker config
│   └── wsgi.py / asgi.py
├── apps/
│   ├── accounts/            # Custom User model (phone-number based auth, OTP ready)
│   ├── roles_permissions/   # RBAC permissions (Admin, Dispatcher, Provider, Customer)
│   ├── vehicles/            # Customer registered vehicle profiles
│   ├── service_catalog/     # Flat tire, battery jumpstart, towing, fuel, etc.
│   ├── providers/           # Provider/Mechanic profiles, spatial location & ratings
│   ├── service_requests/    # Lifecycle state machine & event auditing
│   ├── dispatch/            # Concurrency-safe dispatch matching & offer assignment
│   ├── pricing_quotes/      # On-scene inspection quotes & labor/parts breakdown
│   ├── payments/            # bKash, Nagad (Crypto PKCS1/AES), SSLCommerz & Double-entry ledger
│   ├── financial_ledger/    # Platform revenue & provider settlement reconciliation
│   └── notifications/       # SMS normalization, Unicode part calc, Greenweb & BulkSMSBD, Celery tasks
└── infra/docker/            # PostGIS 15 + Redis 7 Docker compose
```

---

## 📱 SMS Notifications & Telephony Integration (`apps/notifications`)

- **BD Mobile Normalization (`SMSFormatter`)**: Normalizes local variations (`01711-223344`, `88017...`, `+8801...`) into strict E.164 formats (`+8801XXXXXXXXX`). Validates official Bangladeshi telecom prefixes (013, 014, 015, 016, 017, 018, 019).
- **Bangla Unicode & Segment Part Accounting**: Automatically detects Unicode Bengali characters ($>127$), accurately billing 70 chars for single segment or 67 chars per concatenated part vs 160/153 for standard GSM.
- **Bilingual Dynamic Templates**: Instant rendering for `OTP_VERIFICATION`, `REQUEST_ASSIGNED`, `QUOTE_READY`, `PAYMENT_SUCCESS`, `JOB_DISPATCH_ALERT_PROVIDER` in `bn-BD` and `en`.
- **Dual Telephony Gateways**:
  - **Greenweb BD**: Native UTF-8 JSON multi-recipient SMS dispatching.
  - **BulkSMSBD**: Unicode endpoint with response code validation.
- **Celery Transactional Pipeline**: Asynchronous retry backoff (`max_retries=3`, `default_retry_delay=15s`) with persistent delivery audit logging in [`SMSAuditLog`](file:///f:/Al-Ameen%20IT/web/apps/backend/apps/notifications/models.py).

---

## 💳 Payment Gateways Integration

### 1. bKash Tokenized Checkout (`BKASH`)
- Token Grant API with cache-managed token lifecycle
- Redirect checkout session creation
- Server-to-server execute confirmation & idempotency locking

### 2. Nagad Direct PGW (`NAGAD`)
- High-security asymmetric/symmetric cryptographic protocol (`NagadCrypto`)
- 2048-bit RSA PKCS#1 v1.5 encryption & signature verification (SHA256)
- AES-128-CBC payload encryption with unique session keys & IVs
- Two-phase checkout handshake (`initialize` and `complete`)
- Server-to-server query verification (`/verify/payment/{payment_ref_id}`)

### 3. SSLCommerz (`SSLCOMMERZ`)
- Hosted checkout gateway initialization
- Instant Payment Notification (IPN) webhooks
- Step-2 server-side `validationserverAPI` query verification

### 4. Double-Entry Accounting Ledger
- Verified payment automatically splits 15% platform commission (`PLATFORM_REVENUE`) and 85% provider earnings (`PROVIDER_PAYABLE`)
- State machine safely transitions service requests to `completed`

---

## 💰 Provider Payouts & Automated Disbursement Engine (`apps/financial_ledger`)

- **KYC-Verified Payout Destinations (`ProviderPayoutAccount`)**: Supports bKash direct wallet disbursement and 9-digit routing number bank clearing (BEFTN/NPSB) with audit fraud freeze controls (`hold_payouts`).
- **Row-Locking Batch Aggregation (`PayoutSettlementService`)**:
  - Enforces minimum disbursement threshold (৳500.00).
  - Acquires database row locks (`select_for_update()`) over unliquidated `PROVIDER_PAYABLE` credits minus debits.
  - Generates immutable `PayoutBatch` and `PayoutItem` records tied to ledger entries.
- **bKash B2C Corporate Disbursement Client**:
  - Direct tokenized Corporate Master Wallet transfer API with token lifecycle caching.
  - Automatically records balancing `DEBIT` entries on the general ledger upon success to clear provider liability.
  - Fires transactional SMS alerts to the provider.
- **BEFTN Bank Clearing Export (`BankBEFTNExporter`)**:
  - Generates standardized CSV exports for corporate electronic fund transfer clearing through Bangladesh Bank.
- **Celery Beat Schedule**:
  - Automated monthly disbursement master pipeline executes at **02:00 AM on the 1st day of every month** (`crontab(minute=0, hour=2, day_of_month='1')`).

---

## 🚀 Quick Start Guide

### 1. Start Database & Redis (Docker)
```bash
cd infra/docker
docker compose up -d
```

### 2. Python Virtual Environment Setup
```bash
cd ../../apps/backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run Database Migrations
```bash
python manage.py makemigrations accounts roles_permissions vehicles service_catalog providers service_requests dispatch pricing_quotes payments financial_ledger
python manage.py migrate
```

### 4. Run Pytest Suite
```bash
# Concurrency & dispatch state machine tests
pytest apps/dispatch/tests/test_dispatch_concurrency.py

# Multi-gateway payment processing & crypto tests
pytest apps/payments/tests/
```

### 5. Launch API Server
```bash
python manage.py runserver 0.0.0.0:8000
```
- **Interactive Swagger UI:** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **OpenAPI Schema:** [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)
- **Django Admin:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
