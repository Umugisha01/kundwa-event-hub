import {
  Volume2, Lightbulb, Layers, Sparkles, Megaphone, Ticket, Briefcase, Monitor
} from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

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
  highlights: { label: string; value: string }[];
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
    highlights: [
      { label: "Capacity", value: "50 – 50,000+" },
      { label: "Brands", value: "JBL · QSC · d&b" },
      { label: "Engineers", value: "Certified Team" },
      { label: "Support", value: "24/7 On-site" },
    ],
    faqs: [
      { question: "What size events can you cover?", answer: "From 50-person corporate meetings to 50,000+ outdoor festivals. We scale our system to match your venue and audience." },
      { question: "Do you provide sound engineers?", answer: "Yes — all our setups include dedicated sound engineers for seamless operation." },
      { question: "Can I add recording services?", answer: "Multi-track recording and live streaming audio are available. Contact us for details." },
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
    highlights: [
      { label: "Fixtures", value: "200+ Available" },
      { label: "Control", value: "Grand MA" },
      { label: "Setup", value: "Same-day Ready" },
      { label: "Custom", value: "Brand Colors" },
    ],
    faqs: [
      { question: "How early do you need to set up?", answer: "Depending on complexity, setup ranges from 2 hours to a full day. We'll coordinate the timeline with you." },
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
    highlights: [
      { label: "Sizes", value: "4x3m – 20x12m+" },
      { label: "Safety", value: "Certified" },
      { label: "LED", value: "P3.9 Walls" },
      { label: "Crew", value: "Full Team" },
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
    highlights: [
      { label: "Turnaround", value: "3–14 Days" },
      { label: "Deliverables", value: "Print + Digital" },
      { label: "Revisions", value: "Unlimited" },
      { label: "Ownership", value: "Full Rights" },
    ],
    faqs: [
      { question: "How long does branding take?", answer: "Typically 3–14 days depending on the scope. We'll discuss timelines during your consultation." },
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
    highlights: [
      { label: "Channels", value: "10+ Platforms" },
      { label: "Reach", value: "1M+ Audience" },
      { label: "ROI", value: "3–8x Average" },
      { label: "Analytics", value: "Real-time" },
    ],
    faqs: [
      { question: "What ROI can I expect?", answer: "Our campaigns typically deliver 3-8x return on ad spend, depending on event type and target audience." },
      { question: "Do you handle content creation?", answer: "Yes — all engagements include ad creative design. We can also produce video content." },
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
    highlights: [
      { label: "Payments", value: "MoMo + Card" },
      { label: "Validation", value: "QR Codes" },
      { label: "Dashboard", value: "Real-time" },
      { label: "Support", value: "On-site Team" },
    ],
    faqs: [
      { question: "What payment methods are supported?", answer: "MTN Mobile Money, Airtel Money, Visa, Mastercard, and bank transfers." },
      { question: "How do attendees receive tickets?", answer: "Via email and SMS with a unique QR code. They can also access tickets in their dashboard." },
      { question: "Do you provide on-site check-in staff?", answer: "Yes, we can provide trained check-in teams with scanning devices for your event." },
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
    highlights: [
      { label: "Planning", value: "End-to-End" },
      { label: "Venues", value: "50+ Partners" },
      { label: "Catering", value: "Premium" },
      { label: "Coverage", value: "Photo + Video" },
    ],
    faqs: [
      { question: "How far in advance should we book?", answer: "We recommend 4-12 weeks depending on event scale. Contact us to discuss your timeline." },
      { question: "Can you handle international delegates?", answer: "Yes — we arrange airport transfers, hotel bookings, translation services, and cultural programs." },
      { question: "Do you provide team-building activities?", answer: "Yes, we offer curated team-building programs including outdoor adventures, workshops, and cultural experiences." },
    ],
  },
];

export const equipmentRentals = [
  { slug: "screen-rental", name: "Screen Rental", icon: Monitor, image: heroImg, description: "High-resolution LED screens and projectors for presentations, video walls, and live feeds." },
  { slug: "lighting-rental", name: "Lighting System Rental", icon: Lightbulb, image: lightingImg, description: "Professional lighting rigs available for rental — moving heads, PARs, and controllers." },
  { slug: "sound-rental", name: "Sound System Rental", icon: Volume2, image: soundImg, description: "Premium audio equipment — speakers, mixers, microphones, and monitors." },
  { slug: "stage-rental", name: "Stage Rental", icon: Layers, image: stageImg, description: "Modular stage platforms in various sizes, complete with skirting and safety rails." },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug);
}
