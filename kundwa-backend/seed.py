import os
import django
from datetime import datetime, timezone, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kundwa_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import (
    FooterSettings, SiteStatistic, Service, Equipment, Event,
    Testimonial, TrustedBrand, Portfolio
)

def seed():
    print("Seeding database...")

    # Seed Footer Settings
    if not FooterSettings.objects.exists():
        FooterSettings.objects.create(
            contact_email='info@kundwaib.com',
            contact_phone='+250 788 000 000',
            contact_address='Kigali, Rwanda',
            facebook_url='https://facebook.com/kundwaib',
            instagram_url='https://instagram.com/kundwaib',
            twitter_url='https://twitter.com/kundwaib',
            youtube_url='https://youtube.com/kundwaib',
            copyright_text='© Kundwa IB Group. All rights reserved.'
        )
        print("Footer settings seeded.")
    else:
        print("Footer settings already exist.")

    # Seed Site Statistics
    if not SiteStatistic.objects.exists():
        SiteStatistic.objects.create(
            events_produced=520,
            attendees_served=125000,
            years_experience=12,
            countries_reached=6
        )
        print("Site statistics seeded.")
    else:
        print("Site statistics already exist.")

    # Seed Services
    if not Service.objects.exists():
        services_data = [
            {
                "name": "Sound System",
                "description": "High-fidelity concert-grade sound systems tailored for any venue size, including line arrays, mixers, and microphones.",
                "icon": "Volume2",
                "image_url": "/assets/sound-system-BvTBqtrw.jpg"
            },
            {
                "name": "Lighting System",
                "description": "State-of-the-art moving heads, LED wash lights, lasers, and professional lighting desks for immersive atmosphere.",
                "icon": "Lightbulb",
                "image_url": "/assets/lighting-system-nWaROWBf.jpg"
            },
            {
                "name": "Stage Design & Construction",
                "description": "Custom stage structures, truss designs, backdrop production, and runway installation with complete safety certifications.",
                "icon": "Layout",
                "image_url": "/assets/stage-design-CkEBBEdx.jpg"
            }
        ]
        for s in services_data:
            Service.objects.create(**s)
        print("Services seeded.")
    else:
        print("Services already exist.")

    # Seed Equipment
    if not Equipment.objects.exists():
        equip_data = [
            {"name": "L-Acoustics K2 Line Array Speaker", "category": "Audio", "description": "Concert-grade touring speaker", "status": "Available"},
            {"name": "Yamaha CL5 Digital Mixing Console", "category": "Audio", "description": "72-channel professional digital mixer", "status": "Available"},
            {"name": "Sennheiser EW-DX Wireless Mic System", "category": "Audio", "description": "Dual channel digital wireless microphone system", "status": "Available"},
            {"name": "Robe MegaPointe Moving Head", "category": "Lighting", "description": "Versatile beam/spot/wash hybrid lighting fixture", "status": "Available"},
            {"name": "GrandMA3 Light Console", "category": "Lighting", "description": "Industry standard professional lighting controller", "status": "Available"},
            {"name": "P3.9 LED Screen Panel (500x500mm)", "category": "Video", "description": "High brightness outdoor/indoor LED panel", "status": "Available"}
        ]
        for eq in equip_data:
            Equipment.objects.create(**eq)
        print("Equipment seeded.")
    else:
        print("Equipment already exist.")

    # Seed Events
    if not Event.objects.exists():
        events_data = [
            {
                "title": "Kigali Jazz Junction",
                "description": "Africa's premium live jazz event featuring regional and international acts, premium sound engineering, and stunning stage setups.",
                "date": datetime.now(timezone.utc) + timedelta(days=30),
                "location": "Kigali Conference & Exhibition Village",
                "image_url": "/assets/event-concert-BQ1lRCHR.jpg",
                "is_featured": True,
                "ticket_price": 25000.00,
                "total_tickets": 2000,
                "tickets_sold": 150
            },
            {
                "title": "Africa Tech Summit Kigali",
                "description": "Connecting corporate leaders, startups, and investors across Africa. Complete video wall, translation booths, and corporate branding.",
                "date": datetime.now(timezone.utc) + timedelta(days=45),
                "location": "Kigali Convention Centre",
                "image_url": "/assets/event-corporate-Cw1XL7S-.jpg",
                "is_featured": True,
                "ticket_price": 150000.00,
                "total_tickets": 1000,
                "tickets_sold": 420
            },
            {
                "title": "Royal Wedding Gala",
                "description": "Elegant fairy-tale wedding production featuring custom crystal trusses, indoor fireworks, and custom mood lighting design.",
                "date": datetime.now(timezone.utc) + timedelta(days=15),
                "location": "Intare Conference Arena",
                "image_url": "/assets/event-wedding-N62kAoFX.jpg",
                "is_featured": False,
                "ticket_price": 50000.00,
                "total_tickets": 500,
                "tickets_sold": 300
            }
        ]
        for ev in events_data:
            Event.objects.create(**ev)
        print("Events seeded.")
    else:
        print("Events already exist.")

    # Seed Testimonials
    if not Testimonial.objects.exists():
        testimonials_data = [
            {
                "client_name": "Sarah Keza, Event Director at TechCorp",
                "message": "Kundwa IB Group transformed our annual summit. The sound was crystal clear, and the 50-meter LED screen was breathtaking.",
                "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            },
            {
                "client_name": "Jean-Paul Nsengimana, Lead Concert Organizer",
                "message": "When it comes to sound systems and lighting setups in East Africa, there is no one else I trust. Absolute professionals.",
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            }
        ]
        for t in testimonials_data:
            Testimonial.objects.create(**t)
        print("Testimonials seeded.")
    else:
        print("Testimonials already exist.")

    # Seed Trusted Brands
    if not TrustedBrand.objects.exists():
        brands = [
            {"name": "MTN Rwanda", "logo_url": "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100"},
            {"name": "Bank of Kigali", "logo_url": "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=100"},
            {"name": "RwandAir", "logo_url": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100"},
            {"name": "Volkswagen Rwanda", "logo_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100"}
        ]
        for b in brands:
            TrustedBrand.objects.create(**b)
        print("Trusted brands seeded.")
    else:
        print("Trusted brands already exist.")

    # Seed Portfolio
    if not Portfolio.objects.exists():
        portfolios_data = [
            {
                "title": "East Africa Concert Tour",
                "category": "Concerts",
                "description": "Full sound, stage lighting, and rigging setup for a 5-city stadium concert tour. Serviced over 50,000 attendees with zero technical downtime.",
                "thumbnail": "/assets/event-concert-BQ1lRCHR.jpg",
                "images": ["/assets/event-concert-BQ1lRCHR.jpg", "/assets/hero-event-kmSdNpGf.jpg"],
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "date": "December 2025",
                "client": "East Africa Music Group"
            },
            {
                "title": "Global Business Summit",
                "category": "Corporate",
                "description": "High-end corporate production featuring multi-language translation booths, 4K digital video walls, and custom stage design at the convention center.",
                "thumbnail": "/assets/event-corporate-Cw1XL7S-.jpg",
                "images": ["/assets/event-corporate-Cw1XL7S-.jpg", "/assets/hero-event-kmSdNpGf.jpg"],
                "video_url": "",
                "date": "February 2026",
                "client": "Ministry of ICT & Innovation"
            }
        ]
        for p in portfolios_data:
            Portfolio.objects.create(**p)
        print("Portfolios seeded.")
    else:
        print("Portfolios already exist.")

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
