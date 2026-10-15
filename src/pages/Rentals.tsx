import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Wrench, 
  AlertCircle, 
  RefreshCw, 
  Truck, 
  ArrowRight,
  Sparkles,
  FileText,
  User,
  Check,
  CheckCircle2,
  Phone,
  Mail
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore, startOfDay, differenceInCalendarDays } from "date-fns";
import { motion } from "framer-motion";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";
import heroImg from "@/assets/hero-event.jpg";

// Helper component to render icon dynamically
const RentalsIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Wrench;
  return <IconComponent className={className} />;
};

const defaultCategories = ["All", "Screens", "Lighting", "Sound", "Stages"];

const defaultEquipment = [
  { name: "JBL VTX Line Array System", category: "Sound", image: soundImg, icon: "Volume2", price: 0, available: true },
  { name: "Yamaha CL5 Digital Console", category: "Sound", image: soundImg, icon: "Volume2", price: 0, available: true },
  { name: "Shure Axient Digital Mics", category: "Sound", image: soundImg, icon: "Volume2", price: 0, available: true },
  { name: "Beam 350W Moving Head Lights", category: "Lighting", image: lightingImg, icon: "Lightbulb", price: 0, available: true },
  { name: "LED RGBW Stage Wash Pars", category: "Lighting", image: lightingImg, icon: "Lightbulb", price: 0, available: true },
  { name: "grandMA3 Compact Lighting Desk", category: "Lighting", image: lightingImg, icon: "Lightbulb", price: 0, available: true },
  { name: "P3.91 High-Res LED Display", category: "Screens", image: heroImg, icon: "Monitor", price: 0, available: true },
  { name: "Novastar 4K Video Processor", category: "Screens", image: heroImg, icon: "Monitor", price: 0, available: true },
  { name: "Modular Stage System (2x1m)", category: "Stages", image: stageImg, icon: "Layers", price: 0, available: true },
  { name: "Heavy Duty Truss Structure", category: "Stages", image: stageImg, icon: "Layers", price: 0, available: true },
];

const RentalsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  const [active, setActive] = useState("All");
  const [equipment, setEquipment] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Rental Dialog Booking States
  const [bookingItem, setBookingItem] = useState<any | null>(null);
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rentalSuccessModal, setRentalSuccessModal] = useState<any | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(() => addDays(new Date(), 3));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [includeSetup, setIncludeSetup] = useState(false);
  const [rentalNotes, setRentalNotes] = useState("");
  const [startPickerOpen, setStartPickerOpen] = useState(false);
  const [endPickerOpen, setEndPickerOpen] = useState(false);

  useEffect(() => {
    if (bookingItem) {
      if (profile?.full_name && !renterName) setRenterName(profile.full_name);
      if (user?.email && !renterEmail) setRenterEmail(user.email);
      if (profile?.phone && !renterPhone) setRenterPhone(profile.phone);
    }
  }, [bookingItem, profile, user]);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch categories
      try {
        const { data: catData } = await supabase.from("equipment_categories").select("*").order("order");
        if (catData && catData.length > 0) {
          setCategoriesData(catData);
        }
      } catch {
        // ignore
      }

      const { data, error } = await supabase.from("equipment").select("*");
      if (error || !data || data.length === 0) {
        setEquipment(defaultEquipment);
      } else {
        const mapped = data.map((eq: any) => {
          let iconName = "Wrench";
          if (eq.category === "Screens") iconName = "Monitor";
          else if (eq.category === "Lighting") iconName = "Lightbulb";
          else if (eq.category === "Sound") iconName = "Volume2";
          else if (eq.category === "Stages") iconName = "Layers";

          let fallbackImg = heroImg;
          if (eq.category === "Sound") fallbackImg = soundImg;
          else if (eq.category === "Lighting") fallbackImg = lightingImg;
          else if (eq.category === "Stages") fallbackImg = stageImg;

          return {
            id: eq.id,
            name: eq.name,
            category: eq.category,
            image: resolveMediaUrl(eq.image_url, fallbackImg),
            icon: iconName,
            price: 0,
            available: eq.status === "Available"
          };
        });
        setEquipment(mapped);
      }
    } catch {
      setEquipment(defaultEquipment);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const categories = useMemo(() => {
    if (categoriesData.length > 0) {
      const fromEq = Array.from(new Set(equipment.map(e => e.category))).filter(Boolean);
      const existing = new Set(categoriesData.map(c => c.name));
      const orphans = fromEq.filter(c => !existing.has(c));
      return ["All", ...categoriesData.map(c => c.name), ...orphans];
    }
    const distinct = Array.from(new Set(equipment.map(e => e.category))).filter(Boolean);
    return distinct.length > 0 ? ["All", ...distinct] : defaultCategories;
  }, [categoriesData, equipment]);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = differenceInCalendarDays(endDate, startDate);
    return diff <= 0 ? 1 : diff;
  }, [startDate, endDate]);

  const handleSelectStartDate = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(date);
    if (endDate && isBefore(endDate, date)) {
      setEndDate(addDays(date, 1));
    }
    setStartPickerOpen(false);
  };

  const handleSelectEndDate = (date: Date | undefined) => {
    if (!date) return;
    if (startDate && isBefore(date, startDate)) {
      setEndDate(startDate);
    } else {
      setEndDate(date);
    }
    setEndPickerOpen(false);
  };

  const handleSetQuickDuration = (days: number) => {
    const base = startDate || new Date();
    setEndDate(addDays(base, days));
  };

  const handleSubmitRental = async () => {
    if (!bookingItem) return;

    if (!renterName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name or company name.",
        variant: "destructive"
      });
      return;
    }

    if (!renterPhone.trim()) {
      toast({
        title: "Telephone Required",
        description: "Please enter your phone or WhatsApp number for dispatch coordination.",
        variant: "destructive"
      });
      return;
    }

    if (!renterEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    try {
      const payload: any = {
        booking_type: "equipment",
        equipment_name: bookingItem.name,
        equipment_id: bookingItem.id || null,
        amount: 0,
        status: "Pending",
        notes: rentalNotes.trim(),
        start_date: startStr,
        end_date: endStr,
        start_time: startTime,
        end_time: endTime,
        rental_days: rentalDays,
        include_setup: includeSetup,
        customer_name: renterName.trim(),
        customer_phone: renterPhone.trim(),
        customer_email: renterEmail.trim(),
      };

      const { error } = await supabase.from("bookings").insert(payload);
      if (error) throw error;

      setRentalSuccessModal({
        equipmentName: bookingItem.name,
        renterName: renterName.trim(),
        phone: renterPhone.trim(),
        email: renterEmail.trim(),
        days: rentalDays,
        dates: `${startStr} → ${endStr}`,
        time: `${startTime} – ${endTime}`,
        includeSetup,
        notes: rentalNotes.trim()
      });

      setBookingItem(null);
      setRentalNotes("");
      toast({
        title: "Rental Request Submitted!",
        description: `Thank you ${renterName.trim()}. Our team will reach out directly to coordinate dispatch.`,
      });
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message || "Could not submit rental request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookRental = () => {
    if (!bookingItem) return;
    const startStr = format(startDate, "yyyy-MM-dd");
    const endStr = format(endDate, "yyyy-MM-dd");

    addToCart({
      id: `rental-${bookingItem.name}`,
      equipmentId: bookingItem.id,
      type: "rental",
      name: bookingItem.name,
      price: 0,
      image: bookingItem.image,
      startDate: startStr,
      endDate: endStr,
      startTime,
      endTime,
      days: rentalDays,
      includeSetup,
      notes: rentalNotes.trim()
    });
    setRentalNotes("");
    setBookingItem(null);
  };

  const filtered = active === "All" ? equipment : equipment.filter((e) => e.category === active);

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

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold text-sm uppercase tracking-widest inline-block"
          >
            Equipment
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mt-3 mb-5"
          >
            Rent Equipment
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-lg font-medium"
          >
            Premium event equipment available for daily rental. All gear is professionally maintained.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={active === cat ? "default" : "outline"}
                className={active === cat ? "btn-gold" : ""}
                onClick={() => setActive(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Loading equipment rentals...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((item, i) => (
                <div key={i} className="card-premium overflow-hidden group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                    <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${item.available ? "bg-green-500/90 text-primary-foreground" : "bg-destructive/90 text-destructive-foreground"}`}>
                      {item.available ? "Available" : "Booked"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <RentalsIcon name={item.icon} className="h-4 w-4 text-secondary" />
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    </div>
                    <Button 
                      className={`w-full text-sm py-2 ${item.available ? "btn-gold" : "bg-muted text-muted-foreground border border-border/60 cursor-not-allowed"}`}
                      disabled={!item.available}
                      onClick={() => setBookingItem(item)}
                    >
                      {item.available ? "Rent Now" : "Booked / Unavailable"}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-16 px-6 text-center rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md max-w-xl mx-auto my-6">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                    {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <Wrench className="h-8 w-8 text-secondary" />}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {active !== "All"
                      ? `No ${active} Equipment Found`
                      : fetchError 
                        ? "Equipment Catalog Temporarily Unavailable" 
                        : "Equipment Inventory Updating"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {active !== "All"
                      ? `There are currently no items listed under the "${active}" category. Try selecting another category or viewing all items.`
                      : fetchError
                        ? "We could not connect to our inventory service right now. Please verify your connection or contact our rental team directly."
                        : "Our equipment catalog including sound systems, lighting fixtures, LED screens, and stages is being updated online. Contact our rental specialists directly for live availability and quotes."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {active !== "All" ? (
                      <Button variant="outline" onClick={() => setActive("All")} className="btn-gold">
                        View All Categories
                      </Button>
                    ) : (
                      <>
                        <Link to="/contact">
                          <Button className="btn-gold">Contact Rental Desk</Button>
                        </Link>
                        <Button variant="outline" onClick={() => fetchEquipment()} className="gap-2">
                          <RefreshCw className="h-4 w-4" /> Try Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rental Date & Time Configuration Modal */}
      <Dialog open={bookingItem !== null} onOpenChange={(open) => !open && setBookingItem(null)}>
        <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-secondary" /> Rent Equipment
            </DialogTitle>
            <DialogDescription>
              Configure schedule and logistics for:{" "}
              <span className="text-secondary font-semibold">{bookingItem?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {bookingItem && (
            <div className="space-y-4 mt-1">
              {/* Equipment Mini Banner */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/50">
                <img
                  src={bookingItem.image}
                  alt={bookingItem.name}
                  className="w-14 h-14 rounded-lg object-cover border border-border/60 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{bookingItem.name}</h4>
                  <span className="inline-block text-[11px] font-semibold text-secondary uppercase tracking-wider">
                    {bookingItem.category} • Professional Grade
                  </span>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Start Date & Time */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2.5">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-secondary" /> Start Date (Calendar) *
                    </Label>
                    <Popover open={startPickerOpen} onOpenChange={setStartPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full justify-start text-left font-normal mt-1 border-border/60 hover:border-secondary hover:bg-secondary/5 h-10 px-3 cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-secondary shrink-0" />
                          <span className="font-semibold text-xs text-foreground truncate">
                            {startDate ? format(startDate, "EEE, MMM d, yyyy") : "Pick start date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 z-[70] bg-popover border-border/80 shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleSelectStartDate}
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="rentStartTime" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" /> Pickup / Start Time *
                    </Label>
                    <Input
                      id="rentStartTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 h-10 font-semibold text-xs bg-background border-border/60"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2.5">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-secondary" /> End Date (Calendar) *
                    </Label>
                    <Popover open={endPickerOpen} onOpenChange={setEndPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full justify-start text-left font-normal mt-1 border-border/60 hover:border-secondary hover:bg-secondary/5 h-10 px-3 cursor-pointer"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-secondary shrink-0" />
                          <span className="font-semibold text-xs text-foreground truncate">
                            {endDate ? format(endDate, "EEE, MMM d, yyyy") : "Pick end date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2 z-[70] bg-popover border-border/80 shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleSelectEndDate}
                          disabled={(date) => isBefore(date, startOfDay(startDate || new Date()))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="rentEndTime" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-secondary" /> Return / End Time *
                    </Label>
                    <Input
                      id="rentEndTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 h-10 font-semibold text-xs bg-background border-border/60"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/30 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground font-semibold">Quick Duration:</span>
                  {[1, 2, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleSetQuickDuration(days)}
                      className={`px-2 py-0.5 text-[11px] rounded font-medium border transition-all cursor-pointer ${
                        rentalDays === days
                          ? "bg-secondary text-secondary-foreground border-secondary font-bold shadow-sm"
                          : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {days} {days === 1 ? "day" : "days"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground font-semibold">Popular Times:</span>
                  {[
                    { label: "08:00 - 18:00", s: "08:00", e: "18:00" },
                    { label: "10:00 - 22:00", s: "10:00", e: "22:00" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStartTime(preset.s);
                        setEndTime(preset.e);
                      }}
                      className={`px-2 py-0.5 text-[11px] rounded font-medium border transition-all cursor-pointer ${
                        startTime === preset.s && endTime === preset.e
                          ? "bg-secondary text-secondary-foreground border-secondary font-bold shadow-sm"
                          : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Renter Contact Information */}
              <div className="space-y-3 p-3.5 rounded-xl bg-card border border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-secondary" />
                    Renter Contact Information *
                  </Label>
                  <span className="text-[10px] text-muted-foreground font-medium">Required for dispatch</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <Label htmlFor="renterName" className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Full Name / Organization *
                    </Label>
                    <Input
                      id="renterName"
                      required
                      placeholder="e.g. Jean-Paul or MTN Rwanda"
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      className="h-9 text-xs bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <Label htmlFor="renterPhone" className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Telephone / WhatsApp Number *
                      </Label>
                      <Input
                        id="renterPhone"
                        required
                        type="tel"
                        placeholder="+250 788 000 000"
                        value={renterPhone}
                        onChange={(e) => setRenterPhone(e.target.value)}
                        className="h-9 text-xs bg-background"
                      />
                    </div>

                    <div>
                      <Label htmlFor="renterEmail" className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Email Address *
                      </Label>
                      <Input
                        id="renterEmail"
                        required
                        type="email"
                        placeholder="client@organization.rw"
                        value={renterEmail}
                        onChange={(e) => setRenterEmail(e.target.value)}
                        className="h-9 text-xs bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Descriptions & Notes */}
              <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/50">
                <Label htmlFor="rentalNotes" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-secondary" />
                  Special Descriptions & Requirements (Notes)
                </Label>
                <Textarea
                  id="rentalNotes"
                  placeholder="Add special instructions or specifications (e.g. venue address/stage placement, power generator needs, cable run distance, outdoor rain cover, rigging points, loading dock access...)"
                  value={rentalNotes}
                  onChange={(e) => setRentalNotes(e.target.value)}
                  rows={2}
                  className="text-xs resize-none bg-background border-border/60 placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Transport & Setup Checkbox */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/50 hover:border-secondary/40 transition-colors select-none">
                <Checkbox
                  id="includeSetupCheck"
                  checked={includeSetup}
                  onCheckedChange={(checked) => setIncludeSetup(!!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1 cursor-pointer" onClick={() => setIncludeSetup(!includeSetup)}>
                  <Label htmlFor="includeSetupCheck" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-secondary" />
                    Include Professional Transport & Setup
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Our technical road crew dispatches transport vehicles, completes rigging/cabling, and performs audio/visual tuning on-site.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rental Window:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-secondary" />
                    {format(startDate, "MMM d")} → {format(endDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operating Schedule:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    {startTime} – {endTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rental Duration:</span>
                  <span className="font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                    {rentalDays} {rentalDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transport & Setup:</span>
                  <span className="font-semibold text-foreground">{includeSetup ? "Requested" : "Self-pickup / Not requested"}</span>
                </div>
                {rentalNotes.trim() && (
                  <div className="flex justify-between items-start gap-2 border-t border-border/30 pt-1.5">
                    <span className="text-muted-foreground shrink-0">Special Notes:</span>
                    <span className="font-medium text-foreground text-right italic line-clamp-2">
                      "{rentalNotes.trim()}"
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs font-semibold text-muted-foreground">
                  <span>Reservation Type:</span>
                  <span className="text-secondary font-bold">Equipment Rental Request</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button 
                  onClick={handleSubmitRental} 
                  disabled={isSubmitting}
                  className="btn-gold w-full py-5 rounded-xl font-bold gap-2 text-sm shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Submit Rental Request
                    </>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={handleBookRental} 
                  className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                >
                  Or add to Unified Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rental Success Confirmation Dialog */}
      <Dialog open={!!rentalSuccessModal} onOpenChange={(open) => !open && setRentalSuccessModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-extrabold text-lg text-foreground">
              Rental Request Submitted!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Thank you, <strong className="text-foreground">{rentalSuccessModal?.renterName}</strong>. Your reservation for <strong className="text-secondary">{rentalSuccessModal?.equipmentName}</strong> has been logged in our system.
            </DialogDescription>
          </DialogHeader>

          {rentalSuccessModal && (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-bold text-foreground">{rentalSuccessModal.days} day(s) ({rentalSuccessModal.dates})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating Window:</span>
                <span className="font-semibold text-foreground">{rentalSuccessModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Phone:</span>
                <span className="font-bold text-foreground">{rentalSuccessModal.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transport & Setup:</span>
                <span className="font-semibold text-foreground">{rentalSuccessModal.includeSetup ? "Requested" : "Self-Pickup"}</span>
              </div>
              {rentalSuccessModal.notes && (
                <div className="border-t border-border/30 pt-1.5">
                  <span className="text-muted-foreground block text-[11px]">Special Notes:</span>
                  <span className="italic text-foreground">"{rentalSuccessModal.notes}"</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground text-center pt-2 border-t border-border/30">
                Our logistics dispatch team (<a href="tel:+250784289407" className="text-secondary font-bold">+250 784 289 407</a>) will contact you shortly to coordinate delivery.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={() => setRentalSuccessModal(null)} className="w-full btn-gold font-bold text-xs py-4 rounded-xl">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RentalsPage;
