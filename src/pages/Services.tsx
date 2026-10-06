import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowRight, ChevronRight, MessageSquare, Phone, Mail, Send
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { resolveMediaUrl } from "@/config/api";
import { useCart } from "@/contexts/CartContext";
import { 
  Calendar, Check, Sparkles, AlertCircle, Wrench, 
  ShieldAlert, Settings, Info, Loader2, CreditCard, RefreshCw
} from "lucide-react";

// Helper component to render icon dynamically
const ServiceIcon = ({ name, className }: { name: any; className?: string }) => {
  if (name && typeof name !== "string") {
    const IconComponent = name;
    return <IconComponent className={className} />;
  }
  const IconComponent = (Icons as any)[name] || Icons.Settings;
  return <IconComponent className={className} />;
};

const categories = [
  { title: "Event Production", color: "from-primary/80 to-primary" },
  { title: "Event Management", color: "from-secondary/80 to-secondary" },
  { title: "Corporate Events", color: "from-foreground/70 to-foreground/90" },
];

const ServicesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [equipmentRentals, setEquipmentRentals] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  
  // 10-Step Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    category: "Event Production",
    venueType: "indoor",
    capacity: 250,
    eventDate: "2026-08-20",
    durationDays: 1,
    needsSound: true,
    needsLighting: true,
    needsScreens: false,
    needsStage: false,
    needsDecor: false,
    packageTier: "Silver",
    customAddons: [] as string[],
    includeSoundEng: true,
    includeCameraCrew: false,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    paymentOption: "momo",
    momoPhone: ""
  });

  const handleWizardNext = () => {
    if (wizardStep === 4) {
      // Simulate AI analyzing configuration for 2 seconds
      setWizardStep(5);
      setTimeout(() => {
        setWizardStep(6);
      }, 2000);
    } else {
      setWizardStep(prev => prev + 1);
    }
  };

  const handleWizardPrev = () => {
    if (wizardStep === 6) {
      setWizardStep(4); // Skip the simulated AI processing screen on back
    } else {
      setWizardStep(prev => prev - 1);
    }
  };

  // Pricing formula matching Section 6 & 7 of PRD
  const getPackagePrice = () => {
    if (wizardData.packageTier === "Bronze") return 350000;
    if (wizardData.packageTier === "Silver") return 750000;
    return 1800000; // Gold
  };

  const getAddonsPrice = () => {
    let total = 0;
    if (wizardData.customAddons.includes("subwoofer")) total += 40000;
    if (wizardData.customAddons.includes("mic")) total += 10000;
    if (wizardData.customAddons.includes("spotlight")) total += 25000;
    return total;
  };

  const getCrewPrice = () => {
    let daily = 0;
    if (wizardData.includeSoundEng) daily += 30000;
    if (wizardData.includeCameraCrew) daily += 45000;
    return daily * wizardData.durationDays;
  };

  const wizardSubtotal = getPackagePrice() + getAddonsPrice() + getCrewPrice();
  const wizardTax = wizardSubtotal * 0.18; // 18% VAT
  const wizardTotal = wizardSubtotal + wizardTax;
  const wizardDeposit = wizardTotal * 0.30; // 30% secure booking deposit

  const handleWizardSubmit = () => {
    addToCart({
      id: `service-${wizardData.category}-${wizardData.packageTier}`,
      type: "service",
      name: `Production Booking: ${wizardData.category} (${wizardData.packageTier} Package)`,
      price: wizardDeposit, // We charge the deposit amount in the cart
      quantity: 1,
      image: "/assets/hero-event.jpg",
      startDate: wizardData.eventDate,
      days: wizardData.durationDays,
      packageType: wizardData.packageTier
    });
    setInquiryOpen(false);
    // Reset wizard
    setWizardStep(1);
  };

  const loadServicesData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase.from("services").select("*");
      if (error) {
        setFetchError("Unable to retrieve services catalog.");
        setDbServices([]);
      } else if (data && data.length > 0) {
        const mapped = data.map((s: any) => ({
          ...s,
          image_url: resolveMediaUrl(s.image_url, "/assets/hero-event.jpg")
        }));
        setDbServices(mapped);
      } else {
        setDbServices([]);
      }
    } catch {
      setFetchError("Unable to connect to services backend.");
      setDbServices([]);
    } finally {
      setLoading(false);
    }

    // Also fetch equipment rentals for the bottom section
    try {
      const { data } = await supabase.from("equipment").select("*");
      if (data) {
        const mapped = data.slice(0, 4).map((eq: any) => {
          let iconName = "Wrench";
          if (eq.category === "Screens") iconName = "Monitor";
          else if (eq.category === "Lighting") iconName = "Lightbulb";
          else if (eq.category === "Sound") iconName = "Volume2";
          else if (eq.category === "Stages") iconName = "Layers";

          return {
            name: eq.name,
            category: eq.category,
            image: resolveMediaUrl(eq.image_url, "/assets/hero-event.jpg"),
            icon: iconName,
            available: eq.status === "Available"
          };
        });
        setEquipmentRentals(mapped);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadServicesData();
  }, [loadServicesData]);

  const groupedServices = categories.map((cat) => {
    const items = dbServices.filter((s) => s.category === cat.title);
    return {
      title: cat.title,
      color: cat.color,
      items: items
    };
  });

  const handleInquirySubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    supabase
      .from("service_inquiries")
      .insert([
        {
          service_name: inquirySubject,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          message: formData.message,
          status: "Pending"
        }
      ])
      .then(({ error }) => {
        if (error) {
          toast.error("Failed to send inquiry. Please try again.");
        } else {
          toast.success("Inquiry sent successfully! We will contact you soon.");
          setInquiryOpen(false);
        }
      });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const openInquiry = (subject: string) => {
    setWizardData(prev => ({
      ...prev,
      category: subject
    }));
    setWizardStep(1);
    setInquiryOpen(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative text-white pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
        {/* Abstract Geometric Background Design */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Slanted gradient background base */}
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #050814 0%, #0c1730 100%)"
                : "linear-gradient(135deg, #0a1124 0%, #15203d 100%)",
            }}
          />

          {/* Ambient blurred glow layers (Purple top-left, Blue bottom-right) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

          {/* Waves/Flowing Curves (Subtle Opacity SVGs) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] md:opacity-[0.06]" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 C150,20 400,220 800,80 C1100,10 1300,180 1550,120 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-1)" />
            <path d="M-100,200 C300,120 600,320 1000,180 C1300,80 1450,250 1550,220 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-2)" />
            <defs>
              <linearGradient id="bg-wave-gradient-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="bg-wave-gradient-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Abstract Geometric Shapes */}
          <svg className="absolute top-[15%] left-[6%] w-7 h-7 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>
          <svg className="absolute bottom-[20%] left-[8%] w-6 h-6 text-sky-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[18%] left-[48%] w-8 h-8 text-indigo-400/15 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 2.5l9 6.5-3.5 10.5h-11L3 9l9-6.5z" />
          </svg>
          <svg className="absolute top-[25%] right-[8%] w-6 h-6 text-sky-400/25 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[15%] right-[10%] w-6 h-6 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>

          {/* Diagonal slash lines */}
          <svg className="absolute top-[28%] left-[22%] w-16 h-16 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute top-[18%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[12%] left-[16%] w-12 h-12 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[15%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold text-sm uppercase tracking-widest"
          >
            What We Offer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mt-3 mb-5"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-lg font-medium"
          >
            From production to management, we deliver world-class event experiences across Africa.
          </motion.p>
        </div>
      </section>

      {/* Service Categories */}
      {loading ? (
        <section className="section-padding text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm font-semibold">Loading services catalog...</p>
        </section>
      ) : dbServices.length === 0 ? (
        <section className="section-padding">
          <div className="max-w-xl mx-auto py-16 px-6 text-center rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
              {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <Settings className="h-8 w-8 text-secondary" />}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {fetchError ? "Services Service Unavailable" : "Services Catalog Updating"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
              {fetchError
                ? "We are currently unable to reach our services directory. Please check back shortly or connect with our team directly."
                : "Our comprehensive catalog of event production, management, and technical solutions is currently being updated online. Reach out to our production directors for custom inquiries and quotes."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => openInquiry("Custom Event")} className="btn-gold gap-1.5">
                <MessageSquare className="h-4 w-4" /> Custom Event Inquiry
              </Button>
              <Button variant="outline" onClick={() => loadServicesData()} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          </div>
        </section>
      ) : (
        groupedServices.filter((cat) => cat.items.length > 0).map((category, i) => (
          <section key={i} className={`section-padding ${i % 2 === 1 ? "bg-muted/40" : ""}`}>
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-10 items-center"
              >
                {/* Image */}
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <img
                      src={category.items[0]?.image_url || "/assets/hero-event.jpg"}
                      alt={category.title}
                      className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40`} />
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        {category.items.length} {category.items.length === 1 ? "service" : "services"} included
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <span className="text-secondary font-semibold text-xs uppercase tracking-widest">
                    {`0${i + 1}`}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                    {category.title}
                  </h2>

                  <div className="space-y-3 mb-6">
                    {category.items.map((item, j) => (
                      <Link
                        key={j}
                        to={`/services/${item.slug}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                            <ServiceIcon name={item.icon} className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.tagline}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                      </Link>
                    ))}
                  </div>

                  <Button
                    className="btn-gold gap-2"
                    onClick={() => openInquiry(category.title)}
                  >
                    <MessageSquare className="h-4 w-4" /> Inquire About {category.title}
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        ))
      )}

      {/* Equipment Rentals */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Equipment</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-3">Equipment Rentals</h2>
            <p className="text-primary-foreground/60 max-w-xl mx-auto">
              Premium event equipment available for rental — professionally maintained and delivered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipmentRentals.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl overflow-hidden group hover:bg-primary-foreground/10 transition-all duration-300"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ServiceIcon name={item.icon} className="h-4 w-4 text-secondary" />
                    <h3 className="font-semibold text-primary-foreground text-sm">{item.name}</h3>
                  </div>
                  <p className="text-xs text-primary-foreground/60 mb-4 line-clamp-2">{item.description}</p>
                  <Button
                    className="btn-gold w-full text-sm gap-1"
                    onClick={() => openInquiry(item.name)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Get Quote
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10-Step Interactive Service Booking Wizard */}
      <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
        <DialogContent className="sm:max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary animate-pulse" /> 
              {wizardStep === 5 ? "AI Configuration Engine" : "Event Production Planner"}
            </DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 10: {
                wizardStep === 1 ? "Service Category" :
                wizardStep === 2 ? "Venue & Capacity" :
                wizardStep === 3 ? "Event Dates" :
                wizardStep === 4 ? "Core Requirements" :
                wizardStep === 5 ? "Simulating AI Recommendation..." :
                wizardStep === 6 ? "Choose Package Tier" :
                wizardStep === 7 ? "Custom Add-ons" :
                wizardStep === 8 ? "Crew & Staffing" :
                wizardStep === 9 ? "Summary & VAT" :
                "Deposit Payment"
              }
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1 mb-3">
            <div 
              className="bg-secondary h-full transition-all duration-300"
              style={{ width: `${(wizardStep / 10) * 100}%` }}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-4 text-sm">
            {/* Step 1: Category */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Select Event Focus Category</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["Event Production", "Event Management", "Corporate Events", "Private Parties"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setWizardData({ ...wizardData, category: cat })}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                        wizardData.category === cat 
                          ? "border-secondary bg-secondary/10" 
                          : "border-border/40 hover:bg-muted/15"
                      }`}
                    >
                      <span className="font-bold text-sm">{cat}</span>
                      <ChevronRight className="h-4 w-4 text-secondary self-end" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Venue & Capacity */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Venue Layout</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWizardData({ ...wizardData, venueType: "indoor" })}
                      className={`py-3 px-4 rounded-xl border font-bold text-center transition-all ${
                        wizardData.venueType === "indoor" ? "border-secondary bg-secondary/10" : "border-border/40"
                      }`}
                    >
                      Indoor Venue
                    </button>
                    <button
                      onClick={() => setWizardData({ ...wizardData, venueType: "outdoor" })}
                      className={`py-3 px-4 rounded-xl border font-bold text-center transition-all ${
                        wizardData.venueType === "outdoor" ? "border-secondary bg-secondary/10" : "border-border/40"
                      }`}
                    >
                      Outdoor Grounds
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wizCapacity" className="text-xs font-semibold text-muted-foreground">Expected Attendees: {wizardData.capacity}</Label>
                  <Input 
                    id="wizCapacity"
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={wizardData.capacity}
                    onChange={(e) => setWizardData({ ...wizardData, capacity: parseInt(e.target.value) })}
                    className="h-2 bg-secondary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50 guests</span>
                    <span>5,000+ guests</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Dates */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wizDate" className="text-xs font-semibold text-muted-foreground">Event Date</Label>
                  <Input
                    id="wizDate"
                    type="date"
                    value={wizardData.eventDate}
                    onChange={(e) => setWizardData({ ...wizardData, eventDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="wizDuration" className="text-xs font-semibold text-muted-foreground">Setup & Duration (Days): {wizardData.durationDays}</Label>
                  <Input
                    id="wizDuration"
                    type="number"
                    min="1"
                    max="14"
                    value={wizardData.durationDays}
                    onChange={(e) => setWizardData({ ...wizardData, durationDays: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Tech Checklist */}
            {wizardStep === 4 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Select Core Hardware & Production Needs</Label>
                <div className="space-y-2">
                  {[
                    { key: "needsSound", label: "Professional Audio System (Line Array / Speakers)" },
                    { key: "needsLighting", label: "Intelligent Event Lighting & Stage Rigs" },
                    { key: "needsScreens", label: "High-Definition LED Screen Panel Wall" },
                    { key: "needsStage", label: "Aluminium Stage Truss Setup" },
                    { key: "needsDecor", label: "Creative Venue Decoration & Branding" }
                  ].map((srv) => (
                    <label 
                      key={srv.key}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/10 cursor-pointer select-none"
                    >
                      <span className="font-semibold">{srv.label}</span>
                      <input
                        type="checkbox"
                        checked={(wizardData as any)[srv.key]}
                        onChange={(e) => setWizardData({ ...wizardData, [srv.key]: e.target.checked })}
                        className="rounded border-border text-secondary focus:ring-secondary h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: AI Recommendations Loading (Pulsing Interface) */}
            {wizardStep === 5 && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <Loader2 className="h-12 w-12 text-secondary animate-spin" />
                <div className="space-y-1">
                  <h4 className="font-bold text-base">AI Recommendation Engine Running</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Analyzing capacity of {wizardData.capacity} attendees, {wizardData.venueType} venue layout, and active hardware constraints to compile suggested setup configurations...
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Package Tier Selection */}
            {wizardStep === 6 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Suggested Packages Matching Your Profile</Label>
                <div className="space-y-3">
                  {[
                    { tier: "Bronze", price: 350000, desc: "Best for small indoor events. Renders basic sound, 2 mics, and standard stage lights." },
                    { tier: "Silver", price: 750000, desc: "Popular. Includes 4x line-array columns, intelligent moving heads, and 12sqm screen setup." },
                    { tier: "Gold", price: 1800000, desc: "Premium Concert-scale. Massive sound rigs, professional stage truss, backup generators." }
                  ].map((pkg) => (
                    <button
                      key={pkg.tier}
                      onClick={() => setWizardData({ ...wizardData, packageTier: pkg.tier })}
                      className={`p-4 w-full rounded-xl border text-left flex justify-between items-center transition-all ${
                        wizardData.packageTier === pkg.tier 
                          ? "border-secondary bg-secondary/10" 
                          : "border-border/40 hover:bg-muted/15"
                      }`}
                    >
                      <div className="max-w-[70%]">
                        <span className="font-extrabold text-sm flex items-center gap-1.5">
                          {pkg.tier} 
                          {pkg.tier === "Silver" && <Sparkles className="h-3.5 w-3.5 text-secondary shrink-0" />}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 leading-normal">{pkg.desc}</p>
                      </div>
                      <span className="font-black text-secondary text-sm shrink-0">{pkg.price.toLocaleString()} RWF</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Custom Add-ons */}
            {wizardStep === 7 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Optional Hardware Add-ons</Label>
                <div className="space-y-2">
                  {[
                    { key: "subwoofer", label: "Extra Subwoofer System (Double 18\")", price: 40000 },
                    { key: "mic", label: "Additional Shure QLXD Wireless Microphone", price: 10000 },
                    { key: "spotlight", label: "High-power Follow Spotlight (Keynote speaker)", price: 25000 }
                  ].map((add) => {
                    const active = wizardData.customAddons.includes(add.key);
                    return (
                      <label 
                        key={add.key}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/10 cursor-pointer select-none"
                      >
                        <div>
                          <span className="font-semibold block">{add.label}</span>
                          <span className="text-xs text-secondary">+{add.price.toLocaleString()} RWF</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => {
                            const newAddons = e.target.checked 
                              ? [...wizardData.customAddons, add.key] 
                              : wizardData.customAddons.filter(k => k !== add.key);
                            setWizardData({ ...wizardData, customAddons: newAddons });
                          }}
                          className="rounded border-border text-secondary focus:ring-secondary h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 8: Crew & Tech */}
            {wizardStep === 8 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Include Professional Crew Operators</Label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/10 cursor-pointer select-none">
                    <div>
                      <span className="font-semibold block">Certified Sound Engineer</span>
                      <span className="text-xs text-secondary">+30,000 RWF / day</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={wizardData.includeSoundEng}
                      onChange={(e) => setWizardData({ ...wizardData, includeSoundEng: e.target.checked })}
                      className="rounded border-border text-secondary focus:ring-secondary h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/10 cursor-pointer select-none">
                    <div>
                      <span className="font-semibold block">Videographer & Camera Crew</span>
                      <span className="text-xs text-secondary">+45,000 RWF / day</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={wizardData.includeCameraCrew}
                      onChange={(e) => setWizardData({ ...wizardData, includeCameraCrew: e.target.checked })}
                      className="rounded border-border text-secondary focus:ring-secondary h-4 w-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Step 9: Review & Summary */}
            {wizardStep === 9 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground">Detailed Price Summary Breakdown</Label>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/20 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span>Base Package ({wizardData.packageTier}):</span>
                    <span className="font-semibold text-foreground">{getPackagePrice().toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Add-ons:</span>
                    <span className="font-semibold text-foreground">{getAddonsPrice().toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crew & Operations ({wizardData.durationDays} days):</span>
                    <span className="font-semibold text-foreground">{getCrewPrice().toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">{wizardSubtotal.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (18% Local Sales Tax):</span>
                    <span className="font-semibold text-foreground">{wizardTax.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-2.5 text-sm font-extrabold text-foreground">
                    <span>Gross Total:</span>
                    <span className="font-black text-foreground">{wizardTotal.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between bg-secondary/10 p-2.5 rounded-lg border border-secondary/20 font-extrabold text-xs text-secondary">
                    <span>30% Deposit Due Now:</span>
                    <span>{wizardDeposit.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 10: MoMo Deposit Details */}
            {wizardStep === 10 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wizName" className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                  <Input
                    id="wizName"
                    required
                    placeholder="Your Name"
                    value={wizardData.customerName}
                    onChange={(e) => setWizardData({ ...wizardData, customerName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wizEmail" className="text-xs font-semibold text-muted-foreground">Email</Label>
                    <Input
                      id="wizEmail"
                      required
                      type="email"
                      placeholder="email@example.com"
                      value={wizardData.customerEmail}
                      onChange={(e) => setWizardData({ ...wizardData, customerEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wizPhone" className="text-xs font-semibold text-muted-foreground">MoMo Phone</Label>
                    <Input
                      id="wizPhone"
                      required
                      placeholder="+250 78x xxx xxx"
                      value={wizardData.momoPhone}
                      onChange={(e) => setWizardData({ ...wizardData, momoPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-500 flex gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Paying the 30% deposit secures the crew and locks down the equipment inventory for your selected date.</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border/40 flex gap-3">
            {wizardStep > 1 && wizardStep !== 5 && (
              <Button
                variant="outline"
                onClick={handleWizardPrev}
                className="px-6 rounded-xl font-bold"
              >
                Back
              </Button>
            )}
            {wizardStep < 10 && wizardStep !== 5 && (
              <Button
                onClick={handleWizardNext}
                className="btn-gold flex-1 py-3 rounded-xl font-bold gap-1"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {wizardStep === 10 && (
              <Button
                onClick={handleWizardSubmit}
                disabled={!wizardData.customerName || !wizardData.momoPhone}
                className="btn-gold flex-1 py-3 rounded-xl font-bold gap-1 shadow-lg"
              >
                Add Deposit to Cart <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServicesPage;
