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
                "slug": "branding",
                "name": "Branding",
                "category": "Event Management",
                "tagline": "Your event identity, crafted to perfection",
                "description": "We create compelling visual identities that make your event unforgettable. From logo design and color systems to printed materials and digital assets, our creative team ensures every touchpoint reflects your event's personality and resonates with your audience.",
                "icon": "Sparkles",
                "image_url": "/assets/event-corporate-Cw1XL7S-.jpg",
                "gallery_images": ["/assets/event-corporate-Cw1XL7S-.jpg", "/assets/hero-event-kmSdNpGf.jpg", "/assets/event-concert-BQ1lRCHR.jpg"],
                "features": [
                    "Event logo & visual identity design",
                    "Color palette & typography system",
                    "Social media templates & content kits",
                    "Event posters, banners & flyers",
                    "Branded merchandise design",
                    "Stage & venue signage",
                    "Digital invitation design",
                    "Brand guidelines document"
                ],
                "highlights": [
                    {"label": "Turnaround", "value": "3–14 Days"},
                    {"label": "Deliverables", "value": "Print + Digital"},
                    {"label": "Revisions", "value": "Unlimited"},
                    {"label": "Ownership", "value": "Full Rights"}
                ],
                "faqs": [
                    {"question": "How long does branding take?", "answer": "Typically 3–14 days depending on the scope. We'll discuss timelines during your consultation."},
                    {"question": "Do we own the designs?", "answer": "Yes — all final designs and source files are transferred to you upon completion."},
                    {"question": "Can you match existing branding?", "answer": "Absolutely. We can extend your existing brand identity into event-specific materials."}
                ]
            },
            {
                "slug": "advertisement",
                "name": "Advertisement",
                "category": "Event Management",
                "tagline": "Fill every seat, build the buzz",
                "description": "Our multi-channel advertising strategies ensure maximum reach and ticket sales. We combine digital marketing, social media campaigns, influencer partnerships, and traditional media to create buzz that drives attendance and builds lasting brand awareness for your event.",
                "icon": "Megaphone",
                "image_url": "/assets/event-concert-BQ1lRCHR.jpg",
                "gallery_images": ["/assets/event-concert-BQ1lRCHR.jpg", "/assets/event-corporate-Cw1XL7S-.jpg", "/assets/hero-event-kmSdNpGf.jpg"],
                "features": [
                    "Social media ad campaigns (Meta, TikTok, X)",
                    "Google Ads & display network",
                    "Influencer & KOL partnerships",
                    "Radio & TV ad placement",
                    "Billboard & outdoor advertising",
                    "Email marketing campaigns",
                    "PR & press release distribution",
                    "Campaign analytics & reporting"
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
                    {"question": "Can you handle international delegates?", "answer": "Yes — we arrange airport transfers, hotel bookings, translation services, and cultural programs."},
                    {"question": "Do you provide team-building activities?", "answer": "Yes, we offer curated team-building programs including outdoor adventures, workshops, and cultural experiences."}
                ]
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
