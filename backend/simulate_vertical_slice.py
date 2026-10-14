import os
import sys
import django
from decimal import Decimal

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from apps.service_catalog.models import ServiceItem
from apps.vehicles.models import Vehicle
from apps.providers.models import ProviderProfile
from apps.service_requests.models import ServiceRequest
from apps.service_requests.services.state_machine import RequestStateMachine
from apps.pricing_quotes.models import ServiceQuote
from apps.payments.models import PaymentTransaction, PaymentMethod, PaymentStatus
from apps.financial_ledger.services.settlement import DailyPayoutSettlementService

User = get_user_model()

def run_simulation():
    print("=" * 70)
    print("  AMADER MECHANIC - END-TO-END VERTICAL SLICE SIMULATION")
    print("=" * 70)

    # 1. Customer Context
    customer = User.objects.get(phone_number="+8801711223344")
    vehicle = Vehicle.objects.filter(owner=customer).first()
    service = ServiceItem.objects.get(code="TIRE_REPAIR_CAR")

    print(f"\n[STEP 1] Customer Initiates Booking:")
    print(f"  Customer : {customer.first_name} {customer.last_name} ({customer.phone_number})")
    print(f"  Vehicle  : {vehicle.license_plate} - {vehicle.make} {vehicle.model}")
    print(f"  Service  : {service.name} (Base Price: BDT {service.base_price})")

    breakdown_loc = Point(90.4050, 23.7930, srid=4326) # Banani Flyover
    req = ServiceRequest.objects.create(
        customer=customer,
        vehicle=vehicle,
        service_item=service,
        location=breakdown_loc,
        address_text="Banani 11 Overpass, Dhaka",
        status="requested"
    )
    print(f"  -> Service Request Created: ID #{req.id} [Status: {req.status}]")

    # 2. Dispatch Matching
    print(f"\n[STEP 2] Dispatcher Matching Engine:")
    RequestStateMachine.transition_to(req, "matching", reason="System scanning within 5km radius")
    
    # Locate closest verified mechanic
    provider = ProviderProfile.objects.filter(is_verified=True, is_active=True).first()
    req.assigned_provider = provider
    req.save(update_fields=['assigned_provider'])
    RequestStateMachine.transition_to(req, "assigned", reason=f"Assigned to {provider.user.first_name}")
    print(f"  -> Matched Provider: {provider.user.first_name} ({provider.user.phone_number})")
    print(f"  -> State: {req.status}")

    # Provider moves towards vehicle
    RequestStateMachine.transition_to(req, "en_route", reason="Provider en route")
    RequestStateMachine.transition_to(req, "arrived", reason="Provider on-site")
    RequestStateMachine.transition_to(req, "inspection", reason="Diagnostic inspection")
    print(f"  -> Provider arrived at breakdown site and completed physical inspection.")

    # 3. Dynamic Quote Creation
    print(f"\n[STEP 3] Diagnostic Quotation & Customer Approval:")
    quote = ServiceQuote.objects.create(
        service_request=req,
        provider=provider,
        estimated_labor_cost=Decimal("400.00"),
        estimated_parts_cost=Decimal("350.00"),
        breakdown_notes="Tubeless puncture cold vulcanization + valve replacement",
        status="submitted"
    )
    print(f"  -> Mechanic submitted Quote: Labor BDT {quote.estimated_labor_cost} + Parts BDT {quote.estimated_parts_cost}")
    print(f"  -> Total Quote Amount: BDT {quote.total_amount}")

    # Customer reviews and approves quote
    quote.status = "approved"
    quote.save(update_fields=['status'])
    RequestStateMachine.transition_to(
        req, 
        "in_progress", 
        actor=customer, 
        reason=f"Customer approved quote #{str(quote.id)[:8]}"
    )
    print(f"  -> Customer approved quote! [Status: {req.status}]")

    # 4. Job Completion
    print(f"\n[STEP 4] Service Completion:")
    RequestStateMachine.transition_to(req, "awaiting_payment", reason="Tire repair verified by customer test")
    print(f"  -> Repair completed. Awaiting checkout settlement.")

    # 5. Customer Payment (bKash)
    print(f"\n[STEP 5] Payment Checkout & Financial Ledger Settlement:")
    txn = PaymentTransaction.objects.create(
        service_request=req,
        amount=quote.total_amount,
        payment_method=PaymentMethod.BKASH,
        gateway_transaction_id="TRX-BKASH-8819230",
        status=PaymentStatus.COMPLETED
    )
    print(f"  -> bKash Payment Processed: BDT {txn.amount} [TrxID: {txn.gateway_transaction_id}]")

    # Commission & Net Provider Calculation
    commission_rate = Decimal("0.15")
    platform_fee = (quote.total_amount * commission_rate).quantize(Decimal("0.01"))
    provider_net = quote.total_amount - platform_fee

    RequestStateMachine.transition_to(
        req,
        "completed",
        reason=f"Settled via bKash. Fee: BDT {platform_fee}, Provider Net: BDT {provider_net}"
    )

    print("\n" + "=" * 70)
    print("  SIMULATION RESULT: SUCCESSFUL VERTICAL SLICE!")
    print(f"  * Final Job Status        : {req.status.upper()}")
    print(f"  * Gross Transaction Value : BDT {quote.total_amount}")
    print(f"  * Platform Commission (15%): BDT {platform_fee}")
    print(f"  * Provider Net Earning    : BDT {provider_net}")
    print("=" * 70)

if __name__ == "__main__":
    run_simulation()
