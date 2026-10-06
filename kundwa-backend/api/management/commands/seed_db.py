import os
import uuid
from datetime import datetime, timezone, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    Profile, UserRole, FooterSettings, SiteStatistic, Service,
    Equipment, Event, Testimonial, TrustedBrand, Portfolio
)

class Command(BaseCommand):
    help = 'Seeds initial production data (admin user, services, equipment, events, brands, etc.)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Starting database seeding for Kundwa IB Group ---"))

        # 1. Superuser
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@kundwaib.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin@Kundwa2026!')

        admin_user = User.objects.filter(username=username).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f"Created default superuser: {username}"))
        else:
            self.stdout.write(f"Superuser '{username}' already exists.")

        # Ensure admin role
        UserRole.objects.get_or_create(user=admin_user, role='admin')
        Profile.objects.get_or_create(user=admin_user, defaults={'full_name': 'Kundwa Administrator'})

        # 2. Footer Settings
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
            self.stdout.write(self.style.SUCCESS("Footer settings seeded."))
        else:
            self.stdout.write("Footer settings exist.")

        # 3. Site Statistics
        if not SiteStatistic.objects.exists():
            SiteStatistic.objects.create(
                events_produced=520,
                attendees_served=125000,
                years_experience=12,
                countries_reached=6
            )
            self.stdout.write(self.style.SUCCESS("Site statistics seeded."))
        else:
            self.stdout.write("Site statistics exist.")

        # 4. Services
        if not Service.objects.exists():
            services_data = [
                {
                    "slug": "sound-system",
                    "name": "Sound System",
                    "category": "Event Production",
                    "tagline": "Crystal-clear audio for every scale",
                    "description": "Our professional sound systems deliver pristine audio quality for events of any size — from intimate gatherings to massive outdoor festivals. We use industry-leading equipment from brands like JBL, QSC, and d&b audiotechnik, operated by certified sound engineers who ensure every note, word, and beat is heard perfectly.",
                    "icon": "Volume2",
                    "image_url": "/assets/sound-system-BvTBqtrw.jpg",
                    "gallery_images": ["/assets/sound-system-BvTBqtrw.jpg", "/assets/event-concert-BQ1lRCHR.jpg", "/assets/hero-event-kmSdNpGf.jpg"],
                    "features": [
                        "Line array & point-source systems for any venue size",
                        "Wireless microphone systems (Shure, Sennheiser)",
                        "Digital mixing consoles with multi-track recording",
                        "Monitor systems & in-ear monitors for performers",
                        "Subwoofer arrays for deep, powerful bass",
                        "Certified sound engineers included",
                        "Setup, sound-check & teardown handled",
                        "Backup equipment on standby"
                    ],
                    "highlights": [
                        {"label": "Capacity", "value": "50 – 50,000+"},
                        {"label": "Brands", "value": "JBL · QSC · d&b"},
                        {"label": "Engineers", "value": "Certified Team"},
                        {"label": "Support", "value": "24/7 On-site"}
                    ],
                    "faqs": [
                        {"question": "What size events can you cover?", "answer": "From 50-person corporate meetings to 50,000+ outdoor festivals. We scale our system to match your venue and audience."},
                        {"question": "Do you provide sound engineers?", "answer": "Yes — all our setups include dedicated sound engineers for seamless operation."},
                        {"question": "Can I add recording services?", "answer": "Multi-track recording and live streaming audio are available. Contact us for details."}
                    ]
                },
                {
                    "slug": "lighting-system",
                    "name": "Lighting System",
                    "category": "Event Production",
                    "tagline": "Set the mood, steal the show",
                    "description": "Transform any space with our professional lighting systems. From elegant ambient uplighting for galas to high-energy concert rigs with moving heads and lasers, our lighting designers create immersive visual experiences that elevate your event to another level.",
                    "icon": "Lightbulb",
                    "image_url": "/assets/lighting-system-nWaROWBf.jpg",
                    "gallery_images": ["/assets/lighting-system-nWaROWBf.jpg", "/assets/event-concert-BQ1lRCHR.jpg", "/assets/event-corporate-Cw1XL7S-.jpg"],
                    "features": [
                        "Moving head fixtures (beam, spot, wash)",
                        "LED PAR cans & uplighting",
                        "DMX-controlled intelligent lighting",
                        "Haze & fog machines for atmosphere",
                        "Truss systems & rigging",
                        "Follow spots for keynote speakers",
                        "Pixel-mapped LED bars & strips",
                        "Dedicated lighting designer & operator"
                    ],
                    "highlights": [
                        {"label": "Fixtures", "value": "200+ Available"},
                        {"label": "Control", "value": "Grand MA"},
                        {"label": "Setup", "value": "Same-day Ready"},
                        {"label": "Custom", "value": "Brand Colors"}
                    ],
                    "faqs": [
                        {"question": "How early do you need to set up?", "answer": "Depending on complexity, setup ranges from 2 hours to a full day. We'll coordinate the timeline with you."},
                        {"question": "Can you match our brand colors?", "answer": "Absolutely. We program custom color palettes to match your brand identity perfectly."},
                        {"question": "Do you provide outdoor lighting?", "answer": "Yes, we have weatherproof fixtures and generators for outdoor events."}
                    ]
                },
                {
                    "slug": "stage-design",
                    "name": "Stage Design",
                    "category": "Event Production",
                    "tagline": "The stage your event deserves",
                    "description": "Our custom stage designs are engineered for impact and safety. Whether you need a simple podium for a corporate talk or a multi-level concert stage with LED backdrops, our team designs, builds, and installs stages that become the centerpiece of your event.",
                    "icon": "Layers",
                    "image_url": "/assets/stage-design-CkEBBEdx.jpg",
                    "gallery_images": ["/assets/stage-design-CkEBBEdx.jpg", "/assets/hero-event-kmSdNpGf.jpg", "/assets/event-concert-BQ1lRCHR.jpg"],
                    "features": [
                        "Custom stage sizes (4x3m to 20x12m+)",
                        "Multi-level & runway configurations",
                        "LED backdrop walls & video screens",
                        "Structural engineering & safety certification",
                        "Weather-rated outdoor staging",
                        "VIP & speaker platforms",
                        "Branded stage wraps & skirts",
                        "Complete setup & teardown crew"
                    ],
                    "highlights": [
                        {"label": "Sizes", "value": "4x3m – 20x12m+"},
                        {"label": "Safety", "value": "Certified"},
                        {"label": "LED", "value": "P3.9 Walls"},
                        {"label": "Crew", "value": "Full Team"}
                    ],
                    "faqs": [
                        {"question": "Can you build custom shapes?", "answer": "Yes — our fabrication team can create runways, thrust stages, circular stages, and any custom configuration."},
                        {"question": "Is the stage certified safe?", "answer": "All our stages are structurally engineered and certified. We carry full liability insurance."},
                        {"question": "Do you handle permits?", "answer": "We assist with venue and municipal permits required for stage installations."}
                    ]
                },
                {
                    "slug": "marketing-promotion",
                    "name": "Marketing & Promotion",
                    "category": "Event Management",
                    "tagline": "Amplify your reach, fill every seat",
                    "description": "Drive attendance and build buzz with our data-driven event marketing services. From targeted social media campaigns and influencer partnerships to press releases and email marketing, we create multi-channel strategies that sell tickets and create lasting impressions.",
                    "icon": "Megaphone",
                    "image_url": "/assets/event-corporate-Cw1XL7S-.jpg",
                    "gallery_images": ["/assets/event-corporate-Cw1XL7S-.jpg", "/assets/event-concert-BQ1lRCHR.jpg", "/assets/hero-event-kmSdNpGf.jpg"],
                    "features": [
                        "Social media campaign strategy & execution",
                        "Targeted digital advertising (Meta, Google, TikTok)",
                        "Influencer outreach & management",
                        "Press releases & media relations",
                        "Email marketing & attendee nurturing",
                        "On-site content creation & live coverage",
                        "Post-event highlight reels & recaps",
                        "Audience analytics & performance reports"
                    ],
                    "highlights": [
                        {"label": "Channels", "value": "10+ Platforms"},
                        {"label": "Reach", "value": "1M+ Audience"},
                        {"label": "ROI", "value": "3–8x Average"},
                        {"label": "Analytics", "value": "Real-time"}
                    ],
                    "faqs": [
                        {"question": "What ROI can I expect?", "answer": "Our campaigns typically deliver 3-8x return on ad spend, depending on event type and target audience."},
                        {"question": "Do you handle content creation?", "answer": "Yes — all engagements include ad creative design. We can also produce video content."},
                        {"question": "Can you target specific demographics?", "answer": "Absolutely. We use advanced targeting for age, location, interests, and behavior."}
                    ]
                },
                {
                    "slug": "ticketing",
                    "name": "Ticketing",
                    "category": "Event Management",
                    "tagline": "Seamless ticket sales, happy attendees",
                    "description": "Our end-to-end ticketing solutions handle everything from online sales and mobile money payments to QR code validation at the door. We provide real-time analytics, multiple ticket tiers, and a smooth experience for both organizers and attendees.",
                    "icon": "Ticket",
                    "image_url": "/assets/hero-event-kmSdNpGf.jpg",
                    "gallery_images": ["/assets/hero-event-kmSdNpGf.jpg", "/assets/event-concert-BQ1lRCHR.jpg", "/assets/event-corporate-Cw1XL7S-.jpg"],
                    "features": [
                        "Online ticket sales platform",
                        "Mobile Money integration (MTN, Airtel)",
                        "Credit/debit card payments",
                        "QR code ticket generation & validation",
                        "Multiple ticket tiers (VIP, Standard, etc.)",
                        "Real-time sales dashboard",
                        "Attendee check-in system",
                        "Post-event analytics & reports"
                    ],
                    "highlights": [
                        {"label": "Payments", "value": "MoMo + Card"},
                        {"label": "Validation", "value": "QR Codes"},
                        {"label": "Dashboard", "value": "Real-time"},
                        {"label": "Support", "value": "On-site Team"}
                    ],
                    "faqs": [
                        {"question": "What payment methods are supported?", "answer": "MTN Mobile Money, Airtel Money, Visa, Mastercard, and bank transfers."},
                        {"question": "How do attendees receive tickets?", "answer": "Via email and SMS with a unique QR code. They can also access tickets in their dashboard."},
                        {"question": "Do you provide on-site check-in staff?", "answer": "Yes, we can provide trained check-in teams with scanning devices for your event."}
                    ]
                },
                {
                    "slug": "corporate-events",
                    "name": "Corporate Events",
                    "category": "Corporate Events",
                    "tagline": "Professional events that deliver results",
                    "description": "We specialize in delivering polished corporate events — from intimate board meetings to large-scale conferences and gala dinners. Our team handles every detail including venue coordination, AV production, catering, branding, and logistics so you can focus on your message.",
                    "icon": "Briefcase",
                    "image_url": "/assets/event-corporate-Cw1XL7S-.jpg",
                    "gallery_images": ["/assets/event-corporate-Cw1XL7S-.jpg", "/assets/hero-event-kmSdNpGf.jpg", "/assets/stage-design-CkEBBEdx.jpg"],
                    "features": [
                        "Full event planning & coordination",
                        "Venue sourcing & management",
                        "Complete AV & production setup",
                        "Corporate branding & signage",
                        "Catering coordination",
                        "Photography & videography",
                        "Transport & logistics",
                        "Post-event reporting"
                    ],
                    "highlights": [
                        {"label": "Planning", "value": "End-to-End"},
                        {"label": "Venues", "value": "50+ Partners"},
                        {"label": "Catering", "value": "Premium"},
                        {"label": "Coverage", "value": "Photo + Video"}
                    ],
                    "faqs": [
                        {"question": "How far in advance should we book?", "answer": "We recommend 4-12 weeks depending on event scale. Contact us to discuss your timeline."},
                        {"question": "Can you provide multi-language interpretation?", "answer": "Yes, we provide simultaneous interpretation booths, headsets, and certified translators."},
                        {"question": "Do you handle event registration?", "answer": "Yes, our ticketing and registration system handles badging, check-ins, and delegate tracking."}
                    ]
                }
            ]
            for s in services_data:
                Service.objects.create(**s)
            self.stdout.write(self.style.SUCCESS("Services seeded successfully."))
        else:
            self.stdout.write("Services already exist.")

        # 5. Equipment
        if not Equipment.objects.exists():
            equip_data = [
                {"name": "LED Screen 4x3m", "category": "Screens", "image_url": "/assets/hero-event-kmSdNpGf.jpg", "description": "High-resolution LED screens for presentations, video walls, and live feeds.", "status": "Available"},
                {"name": "LED Screen 6x4m", "category": "Screens", "image_url": "/assets/hero-event-kmSdNpGf.jpg", "description": "Concert size high-resolution LED screens for large crowds.", "status": "Available"},
                {"name": "Moving Head Light x4", "category": "Lighting", "image_url": "/assets/lighting-system-nWaROWBf.jpg", "description": "Professional intelligent moving heads for concert dynamic lighting.", "status": "Available"},
                {"name": "PAR LED Set (16pcs)", "category": "Lighting", "image_url": "/assets/lighting-system-nWaROWBf.jpg", "description": "High power color wash lighting set.", "status": "Available"},
                {"name": "Line Array Speaker Set", "category": "Sound", "image_url": "/assets/sound-system-BvTBqtrw.jpg", "description": "Concert-grade L-Acoustics K2 touring speakers.", "status": "Available"},
                {"name": "Digital Mixing Console", "category": "Sound", "image_url": "/assets/sound-system-BvTBqtrw.jpg", "description": "Yamaha CL5 professional 72-channel console.", "status": "Available"},
                {"name": "Stage 4x3m Modular", "category": "Stages", "image_url": "/assets/stage-design-CkEBBEdx.jpg", "description": "Modular stage platforms in various sizes, complete with skirting and safety rails.", "status": "Available"},
                {"name": "Stage 8x6m Full", "category": "Stages", "image_url": "/assets/stage-design-CkEBBEdx.jpg", "description": "Concert grade full stage setup.", "status": "Available"}
            ]
            for eq in equip_data:
                Equipment.objects.create(**eq)
            self.stdout.write(self.style.SUCCESS("Equipment seeded successfully."))
        else:
            self.stdout.write("Equipment already exists.")

        # 6. Events
        events_data = [
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
                "image_url": "/assets/event-concert-BQ1lRCHR.jpg",
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
                "image_url": "/assets/event-corporate-Cw1XL7S-.jpg",
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
                "image_url": "/assets/hero-event-kmSdNpGf.jpg",
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

        for ev in events_data:
            ev_id = uuid.UUID(ev["id"])
            existing = Event.objects.filter(id=ev_id).first()
            if not existing:
                Event.objects.create(
                    id=ev_id,
                    title=ev["title"],
                    description=ev["description"],
                    date=ev["date"],
                    end_date=ev["end_date"],
                    door_time=ev["door_time"],
                    status=ev["status"],
                    location=ev["location"],
                    venue=ev["venue"],
                    organizer=ev["organizer"],
                    category=ev["category"],
                    phone=ev["phone"],
                    image_url=ev["image_url"],
                    is_featured=ev["is_featured"],
                    ticket_price=ev["ticket_price"],
                    total_tickets=ev["total_tickets"],
                    tickets_sold=ev["tickets_sold"],
                    ticket_tiers=ev["ticket_tiers"]
                )
                self.stdout.write(self.style.SUCCESS(f"Created event: {ev['title']}"))
            else:
                self.stdout.write(f"Event '{existing.title}' already exists.")

        # 7. Trusted Brands
        if not TrustedBrand.objects.exists():
            brands = [
                {"name": "MTN Rwanda", "logo_url": "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100"},
                {"name": "Bank of Kigali", "logo_url": "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=100"},
                {"name": "RwandAir", "logo_url": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100"},
                {"name": "Volkswagen Rwanda", "logo_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100"}
            ]
            for b in brands:
                TrustedBrand.objects.create(**b)
            self.stdout.write(self.style.SUCCESS("Trusted brands seeded."))
        else:
            self.stdout.write("Trusted brands already exist.")

        # 8. Testimonials
        if not Testimonial.objects.exists():
            testimonials_data = [
                {
                    "client_name": "Sarah Keza, Event Director at TechCorp",
                    "message": "Kundwa IB Group transformed our annual summit. The sound was crystal clear, and the 50-meter LED screen was breathtaking.",
                    "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                }
            ]
            for t in testimonials_data:
                Testimonial.objects.create(**t)
            self.stdout.write(self.style.SUCCESS("Testimonials seeded."))
        else:
            self.stdout.write("Testimonials already exist.")

        # 9. Portfolio
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
            self.stdout.write(self.style.SUCCESS("Portfolio items seeded."))
        else:
            self.stdout.write("Portfolio already exists.")

        self.stdout.write(self.style.SUCCESS("--- Database seeding completed successfully! ---"))
