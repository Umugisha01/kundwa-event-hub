import os
import django
import uuid
from datetime import datetime, timezone, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kundwa_backend.settings')
django.setup()

from api.models import Event

EVENTS_DATA = [
    {
        "id": "fe67cbf7-b128-4de3-9a20-580d3bcbe584",
        "title": "RYLA RWANDA",
        "description": "Rotary Youth Leadership Awards 2026. Theme: Empowering the next generation of Youth change agents. Inspiring workshops, networking, mentorship, and youth leadership empowerment.",
        "date": datetime(2026, 3, 27, 14, 0, tzinfo=timezone.utc),
        "end_date": datetime(2026, 3, 28, 23, 0, tzinfo=timezone.utc),
        "door_time": "4:00 PM",
        "status": "Active",
        "location": "Kigali Rwanda",
        "venue": "UR Gikondo Campus",
        "organizer": "ROTARY CLUB KIGALI VIRUNGA",
        "category": "Festival",
        "phone": "+250789808030",
        "image_url": "/ryla-rwanda.jpg",
        "is_featured": True,
        "ticket_price": 5000.00,
        "total_tickets": 1600,
        "tickets_sold": 65,
        "ticket_tiers": [
            {
                "id": "tier-early-bird",
                "name": "EARLY BIRD TICKET",
                "price": 5000,
                "capacity": 500,
                "sold": 42,
                "description": "Standard conference & festival grounds entry pass with access to all workshops"
            },
            {
                "id": "tier-gate",
                "name": "GATE TICKET",
                "price": 20000,
                "capacity": 1000,
                "sold": 15,
                "description": "Regular admission on festival days, includes event booklet and general seating"
            },
            {
                "id": "tier-vip",
                "name": "VIP LEADERSHIP PASS",
                "price": 50000,
                "capacity": 100,
                "sold": 8,
                "description": "Reserved front seating, mentor lounge networking access, and evening gala dinner"
            }
        ]
    },
    {
        "id": "fdb64f0c-cea1-46e9-93b1-6be242043e02",
        "title": "Kigali Jazz Junction - Summer Edition",
        "description": "An unforgettable evening of live jazz, fusion rhythms, and world-class performances featuring renowned regional and international musicians at KCEV Camp Kigali.",
        "date": datetime(2026, 7, 22, 18, 0, tzinfo=timezone.utc),
        "end_date": datetime(2026, 7, 22, 23, 59, tzinfo=timezone.utc),
        "door_time": "6:00 PM",
        "status": "Upcoming",
        "location": "Kigali Rwanda",
        "venue": "KCEV Camp Kigali",
        "organizer": "RG Consult Inc & Kundwa IB",
        "category": "Concert",
        "phone": "+250 788 000 000",
        "image_url": "/assets/event-concert.jpg",
        "is_featured": True,
        "ticket_price": 15000.00,
        "total_tickets": 2500,
        "tickets_sold": 210,
        "ticket_tiers": [
            {
                "id": "tier-kjj-regular",
                "name": "REGULAR PASS",
                "price": 15000,
                "capacity": 1500,
                "sold": 150,
                "description": "Standard access to the main amphitheater and festival grounds"
            },
            {
                "id": "tier-kjj-vip",
                "name": "VIP SEATING",
                "price": 35000,
                "capacity": 800,
                "sold": 50,
                "description": "Prime stage-view seating with table service and 1 welcome drink"
            },
            {
                "id": "tier-kjj-vvip",
                "name": "VVIP TABLE LOUNGE",
                "price": 100000,
                "capacity": 200,
                "sold": 10,
                "description": "Exclusive elevated hospitality lounge with complimentary buffet & drinks"
            }
        ]
    },
    {
        "id": "f51dc207-46f0-454c-89cc-cfd3c8e33f88",
        "title": "Rwanda Corporate Tech Summit 2026",
        "description": "East Africa's premier technology, cloud, and AI conference gathering industry innovators, founders, and leaders at Kigali Convention Centre.",
        "date": datetime(2026, 8, 6, 9, 0, tzinfo=timezone.utc),
        "end_date": datetime(2026, 8, 7, 18, 0, tzinfo=timezone.utc),
        "door_time": "9:00 AM",
        "status": "Upcoming",
        "location": "Kigali Rwanda",
        "venue": "Kigali Convention Centre",
        "organizer": "Rwanda Tech Network",
        "category": "Corporate",
        "phone": "+250 788 000 000",
        "image_url": "/assets/event-corporate.jpg",
        "is_featured": True,
        "ticket_price": 50000.00,
        "total_tickets": 1200,
        "tickets_sold": 340,
        "ticket_tiers": [
            {
                "id": "tier-tech-delegate",
                "name": "STANDARD DELEGATE",
                "price": 50000,
                "capacity": 800,
                "sold": 260,
                "description": "Access to all keynote stages, expo arena, and networking lunches"
            },
            {
                "id": "tier-tech-exec",
                "name": "EXECUTIVE ACCESS PASS",
                "price": 120000,
                "capacity": 300,
                "sold": 65,
                "description": "Executive boardroom roundtables, C-level lounge, and speaker reception dinner"
            },
            {
                "id": "tier-tech-investor",
                "name": "INVESTOR & FOUNDER PASS",
                "price": 200000,
                "capacity": 100,
                "sold": 15,
                "description": "Private pitch rooms, 1-on-1 VC meetings, and VIP banquet access"
            }
        ]
    },
    {
        "id": "4b1b2ad3-8ad0-44e2-a5a7-200962118110",
        "title": "Royal Wedding Gala",
        "description": "An extraordinary celebration of love and culture at the prestigious Intare Conference Arena featuring bespoke audiovisuals, lavish stage craft, and gourmet dining.",
        "date": datetime(2026, 7, 7, 16, 0, tzinfo=timezone.utc),
        "end_date": datetime(2026, 7, 7, 23, 0, tzinfo=timezone.utc),
        "door_time": "4:00 PM",
        "status": "Upcoming",
        "location": "Kigali Rwanda",
        "venue": "Intare Conference Arena",
        "organizer": "Kundwa IB Event Productions",
        "category": "Gala",
        "phone": "+250 788 000 000",
        "image_url": "/assets/hero-event.jpg",
        "is_featured": False,
        "ticket_price": 50000.00,
        "total_tickets": 800,
        "tickets_sold": 450,
        "ticket_tiers": [
            {
                "id": "tier-gala-regular",
                "name": "GALA GUEST ENTRY",
                "price": 50000,
                "capacity": 500,
                "sold": 300,
                "description": "General guest admission and seated gourmet dinner service"
            },
            {
                "id": "tier-gala-couple",
                "name": "VIP COUPLE PASS",
                "price": 90000,
                "capacity": 200,
                "sold": 120,
                "description": "Entry for two with reserved prime table and champagne toast"
            },
            {
                "id": "tier-gala-royal",
                "name": "ROYAL TABLE (10 GUESTS)",
                "price": 450000,
                "capacity": 10,
                "sold": 3,
                "description": "Full private table of 10 with private sommelier service"
            }
        ]
    }
]

def seed_rich_events():
    print("Syncing events with canonical metadata matching Events page...")
    for ev_data in EVENTS_DATA:
        ev_id = uuid.UUID(ev_data["id"])
        # Match by ID or by title keywords
        existing = Event.objects.filter(id=ev_id).first()
        if not existing:
            if "RYLA" in ev_data["title"]:
                existing = Event.objects.filter(title__icontains="RYLA").first()
            elif "Jazz" in ev_data["title"]:
                existing = Event.objects.filter(title__icontains="Jazz").first()
            elif "Tech" in ev_data["title"]:
                existing = Event.objects.filter(title__icontains="Tech").first()
            elif "Wedding" in ev_data["title"]:
                existing = Event.objects.filter(title__icontains="Wedding").first()

        if existing:
            existing.title = ev_data["title"]
            existing.description = ev_data["description"]
            existing.date = ev_data["date"]
            existing.end_date = ev_data["end_date"]
            existing.door_time = ev_data["door_time"]
            existing.status = ev_data["status"]
            existing.location = ev_data["location"]
            existing.venue = ev_data["venue"]
            existing.organizer = ev_data["organizer"]
            existing.category = ev_data["category"]
            existing.phone = ev_data["phone"]
            existing.image_url = ev_data["image_url"]
            existing.is_featured = ev_data["is_featured"]
            existing.ticket_price = ev_data["ticket_price"]
            existing.total_tickets = ev_data["total_tickets"]
            existing.tickets_sold = ev_data["tickets_sold"]
            existing.ticket_tiers = ev_data["ticket_tiers"]
            existing.save()
            print(f"Updated event: {existing.title} (ID: {existing.id})")
        else:
            created = Event.objects.create(
                id=ev_id,
                title=ev_data["title"],
                description=ev_data["description"],
                date=ev_data["date"],
                end_date=ev_data["end_date"],
                door_time=ev_data["door_time"],
                status=ev_data["status"],
                location=ev_data["location"],
                venue=ev_data["venue"],
                organizer=ev_data["organizer"],
                category=ev_data["category"],
                phone=ev_data["phone"],
                image_url=ev_data["image_url"],
                is_featured=ev_data["is_featured"],
                ticket_price=ev_data["ticket_price"],
                total_tickets=ev_data["total_tickets"],
                tickets_sold=ev_data["tickets_sold"],
                ticket_tiers=ev_data["ticket_tiers"]
            )
            print(f"Created event: {created.title} (ID: {created.id})")

if __name__ == '__main__':
    seed_rich_events()
