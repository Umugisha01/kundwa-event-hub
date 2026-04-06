import {
  Volume2, Lightbulb, Layers, Sparkles, Megaphone, Ticket, Briefcase, Monitor
} from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

export interface ServicePackage {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export interface ServiceDetail {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  icon: typeof Volume2;
  heroImage: string;
  galleryImages: string[];
  features: string[];
  packages: ServicePackage[];
  faqs: { question: string; answer: string }[];
}

export const services: ServiceDetail[] = [
  {
    slug: "sound-system",
    name: "Sound System",
    category: "Event Production",
    tagline: "Crystal-clear audio for every scale",
    description:
      "Our professional sound systems deliver pristine audio quality for events of any size — from intimate gatherings to massive outdoor festivals. We use industry-leading equipment from brands like JBL, QSC, and d&b audiotechnik, operated by certified sound engineers who ensure every note, word, and beat is heard perfectly.",
    icon: Volume2,
    heroImage: soundImg,
    galleryImages: [soundImg, concertImg, heroImg],
    features: [
      "Line array & point-source systems for any venue size",
      "Wireless microphone systems (Shure, Sennheiser)",
      "Digital mixing consoles with multi-track recording",
      "Monitor systems & in-ear monitors for performers",
      "Subwoofer arrays for deep, powerful bass",
      "Certified sound engineers included",
      "Setup, sound-check & teardown handled",
      "Backup equipment on standby",
    ],
    packages: [
      { name: "Basic", price: "200,000 RWF", features: ["2 Main Speakers (JBL)", "1 Powered Subwoofer", "2 Wireless Microphones", "Basic Mixer", "Setup & Teardown"] },
      { name: "Professional", price: "600,000 RWF", features: ["Line Array System", "4 Subwoofers", "Digital Mixer (32ch)", "6 Wireless Mics", "Monitor Wedges", "Sound Engineer", "Multi-track Recording"], popular: true },
      { name: "Festival", price: "1,800,000 RWF", features: ["Full Line Array (L/R)", "Subwoofer Array", "FOH & Monitor Consoles", "Complete Mic Package", "In-Ear Monitor System", "2 Sound Engineers", "Delay Towers", "48h Setup Window"] },
    ],
    faqs: [
      { question: "What size events can you cover?", answer: "From 50-person corporate meetings to 50,000+ outdoor festivals. We scale our system to match your venue and audience." },
      { question: "Do you provide sound engineers?", answer: "Yes — Professional and Festival packages include dedicated sound engineers. Basic packages include setup guidance." },
      { question: "Can I add recording services?", answer: "Multi-track recording is included in Professional+ packages. We can also arrange live streaming audio." },
    ],
  },
  {
    slug: "lighting-system",
    name: "Lighting System",
    category: "Event Production",
    tagline: "Set the mood, steal the show",
    description:
      "Transform any space with our professional lighting systems. From elegant ambient uplighting for galas to high-energy concert rigs with moving heads and lasers, our lighting designers create immersive visual experiences that elevate your event to another level.",
    icon: Lightbulb,
    heroImage: lightingImg,
    galleryImages: [lightingImg, concertImg, corporateImg],
    features: [
      "Moving head fixtures (beam, spot, wash)",
      "LED PAR cans & uplighting",
      "DMX-controlled intelligent lighting",
      "Haze & fog machines for atmosphere",
      "Truss systems & rigging",
      "Follow spots for keynote speakers",
      "Pixel-mapped LED bars & strips",
      "Dedicated lighting designer & operator",
    ],
    packages: [
      { name: "Ambient", price: "150,000 RWF", features: ["12 LED PAR Lights", "Basic DMX Controller", "Uplighting Package", "Color Wash Effects", "Setup & Programming"] },
      { name: "Show", price: "500,000 RWF", features: ["8 Moving Heads", "20 LED PARs", "Grand MA Controller", "Haze Machine", "Truss & Rigging", "Lighting Designer", "Custom Programming"], popular: true },
      { name: "Spectacular", price: "1,500,000 RWF", features: ["Full Moving Head Rig", "LED Video Panels", "Laser Systems", "Grand MA2 Console", "Complete Truss Grid", "2 Lighting Operators", "Pixel Mapping", "Pyro Effects"] },
    ],
    faqs: [
      { question: "How early do you need to set up?", answer: "Ambient packages need 2-3 hours. Show packages need a half-day. Spectacular rigs require a full day for setup and programming." },
      { question: "Can you match our brand colors?", answer: "Absolutely. We program custom color palettes to match your brand identity perfectly." },
      { question: "Do you provide outdoor lighting?", answer: "Yes, we have weatherproof fixtures and generators for outdoor events." },
    ],
  },
  {
    slug: "stage-design",
    name: "Stage Design",
    category: "Event Production",
    tagline: "The stage your event deserves",
    description:
      "Our custom stage designs are engineered for impact and safety. Whether you need a simple podium for a corporate talk or a multi-level concert stage with LED backdrops, our team designs, builds, and installs stages that become the centerpiece of your event.",
    icon: Layers,
    heroImage: stageImg,
    galleryImages: [stageImg, heroImg, concertImg],
    features: [
      "Custom stage sizes (4x3m to 20x12m+)",
      "Multi-level & runway configurations",
      "LED backdrop walls & video screens",
      "Structural engineering & safety certification",
      "Weather-rated outdoor staging",
      "VIP & speaker platforms",
      "Branded stage wraps & skirts",
      "Complete setup & teardown crew",
    ],
    packages: [
      { name: "Compact", price: "300,000 RWF", features: ["4x3m Stage Platform", "Basic Skirting", "Steps & Ramp", "Podium / Lectern", "Setup & Teardown"] },
      { name: "Standard", price: "900,000 RWF", features: ["8x6m Stage", "Backline Wall", "LED Screen (P3.9)", "Custom Branding", "Truss Roof", "Safety Rails", "Full Crew"], popular: true },
      { name: "Grand", price: "3,000,000 RWF", features: ["12x8m+ Custom Stage", "Multi-Level Design", "Full LED Backdrop", "Hydraulic Elements", "Pyro Integration Points", "VIP Wings", "Structural Engineer", "48h Build Time"] },
    ],
    faqs: [
      { question: "Can you build custom shapes?", answer: "Yes — our fabrication team can create runways, thrust stages, circular stages, and any custom configuration." },
      { question: "Is the stage certified safe?", answer: "All our stages are structurally engineered and certified. We carry full liability insurance." },
      { question: "Do you handle permits?", answer: "We assist with venue and municipal permits required for stage installations." },
    ],
  },
  {
    slug: "branding",
    name: "Branding",
    category: "Event Management",
    tagline: "Your event identity, crafted to perfection",
    description:
      "We create compelling visual identities that make your event unforgettable. From logo design and color systems to printed materials and digital assets, our creative team ensures every touchpoint reflects your event's personality and resonates with your audience.",
    icon: Sparkles,
    heroImage: corporateImg,
    galleryImages: [corporateImg, heroImg, concertImg],
    features: [
      "Event logo & visual identity design",
      "Color palette & typography system",
      "Social media templates & content kits",
      "Event posters, banners & flyers",
      "Branded merchandise design",
      "Stage & venue signage",
      "Digital invitation design",
      "Brand guidelines document",
    ],
    packages: [
      { name: "Essential", price: "150,000 RWF", features: ["Event Logo Design", "Color Palette", "2 Social Media Templates", "1 Poster Design", "Digital Files Package"] },
      { name: "Professional", price: "450,000 RWF", features: ["Full Visual Identity", "10 Social Media Templates", "Poster & Flyer Suite", "Banner Designs", "Branded Merch Concepts", "Brand Guidelines PDF", "2 Revision Rounds"], popular: true },
      { name: "Premium", price: "1,200,000 RWF", features: ["Complete Brand System", "Unlimited Social Templates", "All Print Materials", "Venue Signage Design", "Merchandise Production", "Motion Graphics", "Video Intro/Outro", "Dedicated Designer"] },
    ],
    faqs: [
      { question: "How long does branding take?", answer: "Essential packages: 3-5 days. Professional: 7-10 days. Premium: 2-3 weeks with revisions." },
      { question: "Do we own the designs?", answer: "Yes — all final designs and source files are transferred to you upon completion." },
      { question: "Can you match existing branding?", answer: "Absolutely. We can extend your existing brand identity into event-specific materials." },
    ],
  },
  {
    slug: "advertisement",
    name: "Advertisement",
    category: "Event Management",
    tagline: "Fill every seat, build the buzz",
    description:
      "Our multi-channel advertising strategies ensure maximum reach and ticket sales. We combine digital marketing, social media campaigns, influencer partnerships, and traditional media to create buzz that drives attendance and builds lasting brand awareness for your event.",
    icon: Megaphone,
    heroImage: concertImg,
    galleryImages: [concertImg, corporateImg, heroImg],
    features: [
      "Social media ad campaigns (Meta, TikTok, X)",
      "Google Ads & display network",
      "Influencer & KOL partnerships",
      "Radio & TV ad placement",
      "Billboard & outdoor advertising",
      "Email marketing campaigns",
      "PR & press release distribution",
      "Campaign analytics & reporting",
    ],
    packages: [
      { name: "Digital", price: "200,000 RWF", features: ["Social Media Ads (2 platforms)", "Ad Creative Design", "2-Week Campaign", "Basic Analytics Report", "Audience Targeting"] },
      { name: "Multi-Channel", price: "700,000 RWF", features: ["All Social Platforms", "Google Ads Campaign", "2 Influencer Partners", "Email Campaign (5,000+)", "Radio Spots", "4-Week Campaign", "Weekly Reports", "A/B Testing"], popular: true },
      { name: "Full Force", price: "2,000,000 RWF", features: ["All Digital Channels", "5+ Influencer Partners", "TV Commercial Spot", "Billboard Placement", "PR & Media Coverage", "Email + SMS Campaigns", "6-Week Campaign", "Dedicated Campaign Manager"] },
    ],
    faqs: [
      { question: "What ROI can I expect?", answer: "Our campaigns typically deliver 3-8x return on ad spend, depending on event type and target audience." },
      { question: "Do you handle content creation?", answer: "Yes — all packages include ad creative design. Premium packages include video content." },
      { question: "Can you target specific demographics?", answer: "Absolutely. We use advanced targeting for age, location, interests, and behavior." },
    ],
  },
  {
    slug: "ticketing",
    name: "Ticketing",
    category: "Event Management",
    tagline: "Seamless ticket sales, happy attendees",
    description:
      "Our end-to-end ticketing solutions handle everything from online sales and mobile money payments to QR code validation at the door. We provide real-time analytics, multiple ticket tiers, and a smooth experience for both organizers and attendees.",
    icon: Ticket,
    heroImage: heroImg,
    galleryImages: [heroImg, concertImg, corporateImg],
    features: [
      "Online ticket sales platform",
      "Mobile Money integration (MTN, Airtel)",
      "Credit/debit card payments",
      "QR code ticket generation & validation",
      "Multiple ticket tiers (VIP, Standard, etc.)",
      "Real-time sales dashboard",
      "Attendee check-in system",
      "Post-event analytics & reports",
    ],
    packages: [
      { name: "Basic", price: "100,000 RWF", features: ["Online Ticket Page", "2 Ticket Types", "Mobile Money Payments", "QR Code Tickets", "Basic Sales Report"] },
      { name: "Pro", price: "350,000 RWF", features: ["Custom Ticket Page", "Unlimited Ticket Types", "All Payment Methods", "QR Check-in App", "Real-time Dashboard", "Promo Codes", "Attendee Database", "Email Confirmations"], popular: true },
      { name: "Enterprise", price: "800,000 RWF", features: ["White-label Platform", "Unlimited Everything", "Reserved Seating Maps", "Group Bookings", "API Integration", "Dedicated Support", "On-site Check-in Team", "Full Analytics Suite"] },
    ],
    faqs: [
      { question: "What payment methods are supported?", answer: "MTN Mobile Money, Airtel Money, Visa, Mastercard, and bank transfers." },
      { question: "How do attendees receive tickets?", answer: "Via email and SMS with a unique QR code. They can also access tickets in their dashboard." },
      { question: "What are the transaction fees?", answer: "Package prices are flat fees. Payment processing fees (2-3%) are separate." },
    ],
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    category: "Corporate Events",
    tagline: "Professional events that deliver results",
    description:
      "We specialize in delivering polished corporate events — from intimate board meetings to large-scale conferences and gala dinners. Our team handles every detail including venue coordination, AV production, catering, branding, and logistics so you can focus on your message.",
    icon: Briefcase,
    heroImage: corporateImg,
    galleryImages: [corporateImg, heroImg, stageImg],
    features: [
      "Full event planning & coordination",
      "Venue sourcing & management",
      "Complete AV & production setup",
      "Corporate branding & signage",
      "Catering coordination",
      "Photography & videography",
      "Transport & logistics",
      "Post-event reporting",
    ],
    packages: [
      { name: "Half-Day", price: "500,000 RWF", features: ["Venue Coordination", "Basic AV Setup", "Branding & Signage", "Event Manager", "Photography", "Catering Coordination"] },
      { name: "Full-Day", price: "1,500,000 RWF", features: ["Full AV Production", "Custom Branding Suite", "Premium Catering", "Photography + Videography", "Transport Logistics", "Dedicated Event Manager", "Live Streaming Option"], popular: true },
      { name: "Multi-Day", price: "4,000,000 RWF", features: ["Complete Production", "Premium Everything", "Full Catering (all meals)", "Photo + Video + Drone", "Hotel & Transport", "Dedicated Team (5+)", "Daily Reporting", "Post-event Video Edit"] },
    ],
    faqs: [
      { question: "How far in advance should we book?", answer: "We recommend 4-8 weeks for half-day events and 8-12 weeks for multi-day conferences." },
      { question: "Can you handle international delegates?", answer: "Yes — we arrange airport transfers, hotel bookings, translation services, and cultural programs." },
      { question: "Do you provide team-building activities?", answer: "Yes, we offer curated team-building programs including outdoor adventures, workshops, and cultural experiences." },
    ],
  },
];

export const equipmentRentals = [
  { slug: "screen-rental", name: "Screen Rental", icon: Monitor, price: "150,000", image: heroImg, description: "High-resolution LED screens and projectors for presentations, video walls, and live feeds." },
  { slug: "lighting-rental", name: "Lighting System Rental", icon: Lightbulb, price: "80,000", image: lightingImg, description: "Professional lighting rigs available for daily rental — moving heads, PARs, and controllers." },
  { slug: "sound-rental", name: "Sound System Rental", icon: Volume2, price: "200,000", image: soundImg, description: "Premium audio equipment rental — speakers, mixers, microphones, and monitors." },
  { slug: "stage-rental", name: "Stage Rental", icon: Layers, price: "180,000", image: stageImg, description: "Modular stage platforms in various sizes, complete with skirting and safety rails." },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug);
}
