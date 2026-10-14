import sys
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from apps.service_catalog.models import ServiceItem
from apps.vehicles.models import Vehicle
from apps.providers.models import ProviderProfile

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds initial pilot data for Amader Mechanic (Dhaka Emergency Pilot Launch)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== Seeding Dhaka Pilot Data for Amader Mechanic ==="))

        # 1. Services Catalog
        services_data = [
            {
                "code": "TIRE_REPAIR_CAR",
                "name": "প্রাইভেট কার টায়ার মেরামত ও পরিবর্তন",
                "description": "অন-সাইট টায়ার লিফটিং, পাংচার প্লাগিং ও স্পেয়ার হুইল ফিটিং",
                "base_price": Decimal("750.00"),
            },
            {
                "code": "TIRE_REPAIR_BIKE",
                "name": "মোটরসাইকেল টায়ার পাংচার সার্ভিস",
                "description": "টিউবলেস পাংচার রিপেয়ার ও পোর্টেবল এয়ার প্রেসার ইনফ্লেশন",
                "base_price": Decimal("400.00"),
            },
            {
                "code": "JUMPSTART_BATTERY",
                "name": "ব্যাটারি জাম্পস্টার্ট ও ভোল্টেজ চেক",
                "description": "১২V/২৪V হেভি ডিউটি জাম্পার কেবলস ও ডায়নামো ডায়াগনসিস",
                "base_price": Decimal("600.00"),
            },
            {
                "code": "FUEL_EMERGENCY",
                "name": "জরুরি ফুয়েল (অকটেন/ডিজেল) ডেলিভারি",
                "description": "৫ লিটার অনুমোদিত সেফটি ক্যানে সরাসরি ঘটনাস্থলে ডেলিভারি",
                "base_price": Decimal("500.00"),
            },
            {
                "code": "TOWING_HYDRAULIC",
                "name": "হাইড্রোলিক উইঞ্চ ও ফ্ল্যাটবেড টোয়িং",
                "description": "দুর্ঘটনাগ্রস্ত বা অচল গাড়ি নিরাপদে নিকটস্থ ওয়ার্কশপে স্থানান্তর",
                "base_price": Decimal("3500.00"),
            },
            {
                "code": "OVERHEATING_ENGINE",
                "name": "ইঞ্জিন ওভারহিটিং ও মেকানিক্যাল ডায়াগনোসিস",
                "description": "রেডিয়েটর লিক, কুল্যান্ট টপ-আপ এবং বেল্ট ফ্যান ইন্সপেকশন",
                "base_price": Decimal("1450.00"),
            },
        ]

        for s in services_data:
            item, created = ServiceItem.objects.update_or_create(
                code=s["code"],
                defaults={
                    "name": s["name"],
                    "description": s["description"],
                    "base_price": s["base_price"],
                    "is_active": True,
                }
            )
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  [Service] {status_text}: {item.name}")

        # 2. Admin & Dispatcher Users
        admin_user, _ = User.objects.update_or_create(
            phone_number="+8801700000001",
            defaults={
                "username": "+8801700000001",
                "email": "admin@amaderservice.com",
                "first_name": "সুপার",
                "last_name": "অ্যাডমিন",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
                "is_phone_verified": True,
            }
        )
        admin_user.set_password("AntigravityAdmin2026!")
        admin_user.save()
        self.stdout.write(f"  [User] Admin user created: {admin_user.phone_number}")

        dispatcher_user, _ = User.objects.update_or_create(
            phone_number="+8801700000002",
            defaults={
                "username": "+8801700000002",
                "email": "dispatcher@amaderservice.com",
                "first_name": "ঢাকা সেন্ট্রাল",
                "last_name": "ডিসপ্যাচার",
                "role": "dispatcher",
                "is_staff": True,
                "is_phone_verified": True,
            }
        )
        dispatcher_user.set_password("DispatcherDhaka2026!")
        dispatcher_user.save()
        self.stdout.write(f"  [User] Dispatcher user created: {dispatcher_user.phone_number}")

        # 3. Pilot Customer & Vehicles
        customer_user, _ = User.objects.update_or_create(
            phone_number="+8801711223344",
            defaults={
                "username": "+8801711223344",
                "email": "tanvir.hasan@gmail.com",
                "first_name": "তানভীর",
                "last_name": "হাসান",
                "role": "customer",
                "is_phone_verified": True,
            }
        )
        customer_user.set_password("CustomerPass2026!")
        customer_user.save()

        Vehicle.objects.update_or_create(
            license_plate="ঢাকা মেট্রো-গ ১২-৩৪৫৬",
            defaults={
                "owner": customer_user,
                "vehicle_type": "Car",
                "make": "Toyota",
                "model": "Corolla Altis",
                "year": 2021,
                "color": "Pearl White",
            }
        )
        Vehicle.objects.update_or_create(
            license_plate="ঢাকা মেট্রো-হ ২১-৯৮৭৬",
            defaults={
                "owner": customer_user,
                "vehicle_type": "Motorbike",
                "make": "Yamaha",
                "model": "FZS Version 3",
                "year": 2022,
                "color": "Matte Black",
            }
        )
        self.stdout.write(f"  [Customer] Tanvir Hasan registered with 2 vehicles.")

        # 4. Verified Dhaka Mechanics
        mechanics_data = [
            {
                "phone": "+8801712000001",
                "name": "মোঃ রফিকুল ইসলাম",
                "lat": 23.7937, "lng": 90.4066, # Gulshan/Banani
                "vehicle_type": "Car & Microbus Specialist",
                "nid": "19882691234567890",
            },
            {
                "phone": "+8801812000002",
                "name": "আলমগীর কবির",
                "lat": 23.8070, "lng": 90.3686, # Mirpur 10
                "vehicle_type": "Bike & Light Commercial",
                "nid": "19912691234567891",
            },
            {
                "phone": "+8801912000003",
                "name": "মেঘনা হাইওয়ে রিকভারি",
                "lat": 23.7080, "lng": 90.4350, # Jatrabari / Kanchpur
                "vehicle_type": "Heavy Hydraulic Towing",
                "nid": "19852691234567892",
            },
        ]

        for m in mechanics_data:
            user_obj, _ = User.objects.update_or_create(
                phone_number=m["phone"],
                defaults={
                    "username": m["phone"],
                    "first_name": m["name"],
                    "role": "provider",
                    "is_phone_verified": True,
                }
            )
            user_obj.set_password("MechanicPass2026!")
            user_obj.save()

            profile, _ = ProviderProfile.objects.update_or_create(
                user=user_obj,
                defaults={
                    "is_active": True,
                    "is_verified": True,
                    "location": Point(m["lng"], m["lat"], srid=4326),
                    "service_radius_km": 15,
                }
            )
            self.stdout.write(f"  [Provider] Verified Pilot Mechanic: {m['name']} ({m['phone']})")

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Dhaka Pilot Data seeded successfully!"))
