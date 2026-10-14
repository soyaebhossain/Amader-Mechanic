# আমাদের মেকানিক (Amader Mechanic) 🇧🇩🚗🔧

> **Production-Oriented Roadside Assistance Marketplace & SaaS Platform for Bangladesh**
> Connecting breakdown vehicles with verified mechanics, towing operators, recovery services, garages, and corporate fleet managers across Bangladesh.

---

## 🏛 Platform Architecture

```
Amader Mechanic/
├── backend/            # Django 4.2 + PostGIS 15 + Django REST Framework + Celery
│   ├── apps/
│   │   ├── accounts/          # Phone OTP authentication & JWT sessions
│   │   ├── roles_permissions/ # Fine-grained RBAC (Customer, Provider, Dispatcher, Admin)
│   │   ├── vehicles/          # Multi-category vehicle profiles (Bike, Car, Van, Bus, Truck)
│   │   ├── service_catalog/   # Breakdown service categories & pricing tiers
│   │   ├── providers/         # Mechanic profiles, skills, verification states, service radius
│   │   ├── service_requests/  # 15-state lifecycle state machine & incident location
│   │   ├── dispatch/          # Geospatial matching engine, offer timeouts & atomic assignment
│   │   ├── pricing_quotes/    # Fixed-precision decimal quotes & customer approval flow
│   │   ├── payments/          # Multi-gateway (bKash Tokenized, SSLCommerz, Nagad RSA/AES)
│   │   ├── financial_ledger/  # Double-entry ledger, BEFTN CSV exporter & OTP-protected payout
│   │   └── notifications/     # SMS normalization, Unicode/Bengali billing & Celery pipeline
│   └── config/                # Modular settings & OpenAPI 3 (drf-spectacular)
├── customer-web/       # Next.js 14 App Router customer booking & live tracking portal
├── admin-web/          # Next.js 14 dispatch command center & KYC verification dashboard
├── customer-mobile/    # React Native / Expo customer mobile app (Emergency breakdown wizard)
├── provider-mobile/    # React Native / Expo provider app (Earnings, wallet, OTP payout wizard)
└── infra/docker/       # PostGIS 15 + Redis 7 Docker compose
```

---

## 🚀 Quick Start Guide

### 1. Database & Cache Infrastructure (Docker)
```bash
cd "Amader Mechanic"
docker-compose -f infra/docker/docker-compose.yml up -d
```

### 2. Backend API Service
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
- **OpenAPI / Swagger UI Docs**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

### 3. Customer Web Portal
```bash
cd customer-web
npm install
npm run dev
```
- **Web Portal URL**: [http://localhost:3005](http://localhost:3005)

### 4. Admin & Dispatcher Dashboard
```bash
cd admin-web
npm install
npm run dev
```
- **Admin Dashboard URL**: [http://localhost:3001](http://localhost:3001)

### 5. Mobile Applications (Expo)
- **Customer Mobile**:
  ```bash
  cd customer-mobile
  npm install
  npm start
  ```
- **Provider Mobile**:
  ```bash
  cd provider-mobile
  npm install
  npm start
  ```

---

## 🔐 Security & Financial Controls
- **Zero Raw Floating-Point Arithmetic**: All fees, commissions, and VAT use Python `Decimal` / fixed-precision.
- **Atomic Concurrency Protection**: Race conditions on dispatch offers are locked via `select_for_update()`.
- **Payout Protection**: 6-digit OTP verification with 5-minute TTL, 60s cooldown, 3-attempt brute-force lock, and constant-time compare (`secrets.compare_digest`).
- **Verified Payment Handshakes**: Server-to-server webhook verification for bKash, Nagad, and SSLCommerz.

---

## 📄 License & Attribution
Developed for **Amader Mechanic Technologies BD**. All rights reserved.
