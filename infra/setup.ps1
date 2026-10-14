Write-Host "=== Setting up Amader Mechanic (Roadside Assistance BD) ===" -ForegroundColor Cyan

# 1. Start Docker Containers
Write-Host "`n[1/5] Starting PostGIS and Redis..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Set-Location "$PSScriptRoot\infra\docker"
    docker compose up -d
    Set-Location "$PSScriptRoot\apps\backend"
} else {
    Write-Warning "Docker not found or not running. Please start Docker Desktop if using containerized PostgreSQL/PostGIS."
}

# 2. Virtual Environment Setup
Write-Host "`n[2/5] Setting up Python virtual environment..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\pip.exe" install -r requirements.txt

# 3. Database Migrations
Write-Host "`n[3/5] Running database migrations..." -ForegroundColor Yellow
& ".\venv\Scripts\python.exe" manage.py makemigrations accounts roles_permissions vehicles service_catalog providers service_requests dispatch pricing_quotes payments financial_ledger notifications
& ".\venv\Scripts\python.exe" manage.py migrate

# 4. Run Pytest Suite
Write-Host "`n[4/5] Running test suite..." -ForegroundColor Yellow
& ".\venv\Scripts\pytest.exe" apps/dispatch/tests/test_dispatch_concurrency.py
& ".\venv\Scripts\pytest.exe" apps/payments/tests/
& ".\venv\Scripts\pytest.exe" apps/notifications/tests/
& ".\venv\Scripts\pytest.exe" apps/financial_ledger/tests/

# 5. Run Server
Write-Host "`n[5/5] Launching Django development server..." -ForegroundColor Green
& ".\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
