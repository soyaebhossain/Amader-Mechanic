#!/usr/bin/env bash
set -e

echo "=== Setting up Amader Mechanic (Roadside Assistance BD) for Antigravity ==="

# Directory layout creation
mkdir -p apps/backend/config/settings
mkdir -p apps/backend/apps/{accounts,roles_permissions,vehicles,service_catalog,providers,dispatch,service_requests,pricing_quotes,payments,financial_ledger}
mkdir -p apps/backend/apps/service_requests/services
mkdir -p apps/backend/apps/dispatch/services
mkdir -p apps/backend/apps/dispatch/tests
mkdir -p infra/docker

echo "Directory structure created successfully."

# 1. Start Database & Redis via Docker
echo "Starting PostGIS and Redis via Docker Compose..."
cd infra/docker
docker compose up -d
cd ../../apps/backend

# 2. Virtual environment setup and dependency installation
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate || source venv/Scripts/activate

echo "Installing requirements..."
pip install -r requirements.txt

# 3. Database migrations
echo "Running migrations..."
python manage.py makemigrations accounts roles_permissions vehicles service_catalog providers service_requests dispatch pricing_quotes payments financial_ledger notifications
python manage.py migrate

# 4. Run Concurrency, Payment Gateway, Notification, and Settlement Tests
echo "Running test suite..."
pytest apps/dispatch/tests/test_dispatch_concurrency.py
pytest apps/payments/tests/
pytest apps/notifications/tests/
pytest apps/financial_ledger/tests/

# 5. Start development server
echo "Starting API server at http://0.0.0.0:8000..."
python manage.py runserver 0.0.0.0:8000
