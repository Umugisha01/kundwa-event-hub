import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { Calendar } from "lucide-react";
import soundImg from "@/assets/sound-system.jpg";
import lightingImg from "@/assets/lighting-system.jpg";
import stageImg from "@/assets/stage-design.jpg";
import heroImg from "@/assets/hero-event.jpg";

// Helper component to render icon dynamically
const RentalsIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Wrench;
  return <IconComponent className={className} />;
};

const categories = ["All", "Screens", "Lighting", "Sound", "Stages"];

const mockEquipment = [
  {
    name: "LED Screen P3.91 Outdoor",
    category: "Screens",
    image: heroImg,
    icon: "Monitor",
    price: 75000,
    available: true,
  },
  {
    name: "L-Acoustics K2 Line Array",
    category: "Sound",
    image: soundImg,
    icon: "Volume2",
    price: 120000,
    available: true,
  },
  {
    name: "Robe BMFL Blade Moving Head",
    category: "Lighting",
    image: lightingImg,
    icon: "Lightbulb",
    price: 45000,
    available: true,
  },
  {
    name: "Aluminium Stage Truss 12x10m",
    category: "Stages",
    image: stageImg,
    icon: "Layers",
    price: 90000,
    available: true,
  },
  {
    name: "Pioneer DJ Nexus 2 Set",
    category: "Sound",
    image: soundImg,
    icon: "Volume2",
    price: 50000,
    available: true,
  },
  {
    name: "MA Lighting grandMA3 compact XT",
    category: "Lighting",
    image: lightingImg,
    icon: "Lightbulb",
    price: 85000,
    available: false,
  },
];

const RentalsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { addToCart } = useCart();
  const [active, setActive] = useState("All");
  const [equipment, setEquipment] = useState<any[]>(mockEquipment);
  const [loading, setLoading] = useState(true);

  // Rental Dialog Booking States
  const [bookingItem, setBookingItem] = useState<any | null>(null);
  const [startDate, setStartDate] = useState("2026-07-15");
  const [endDate, setEndDate] = useState("2026-07-17");
  const [includeSetup, setIncludeSetup] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("equipment")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((eq: any) => {
            // Map category to icon string
            let iconName = "Wrench";
            if (eq.category === "Screens") iconName = "Monitor";
            else if (eq.category === "Lighting") iconName = "Lightbulb";
            else if (eq.category === "Sound") iconName = "Volume2";
            else if (eq.category === "Stages") iconName = "Layers";

            return {
              name: eq.name,
              category: eq.category,
              image: eq.image_url || heroImg,
              icon: iconName,
              price: eq.price_per_day || 35000,
              available: eq.status === "Available"
            };
          });
          setEquipment(mapped);
        }
        setLoading(false);
      });
  }, []);

  const handleBookRental = () => {
    if (!bookingItem) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    addToCart({
      id: `rental-${bookingItem.name}`,
      type: "rental",
      name: bookingItem.name,
      price: bookingItem.price,
      image: bookingItem.image,
      startDate,
      endDate,
      days: diffDays,
      includeSetup
    });
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

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Equipment</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-5">Rent Equipment</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
            Premium event equipment available for daily rental. All gear is professionally maintained.
          </p>
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
                    <div className="flex items-center gap-2 mb-2">
                      <RentalsIcon name={item.icon} className="h-4 w-4 text-secondary" />
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-muted-foreground">Rate:</span>
                      <span className="text-sm font-extrabold text-foreground">{item.price.toLocaleString()} RWF/day</span>
                    </div>
                    <Button 
                      className="btn-gold w-full text-sm py-2" 
                      disabled={!item.available}
                      onClick={() => setBookingItem(item)}
                    >
                      {item.available ? "Rent Now" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8 col-span-4">No equipment found.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rental Date Configuration Modal */}
      <Dialog open={bookingItem !== null} onOpenChange={(open) => !open && setBookingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" /> Rent Equipment
            </DialogTitle>
            <DialogDescription>
              Configure dates for: <span className="text-secondary font-medium">{bookingItem?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {bookingItem && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rentStart" className="text-xs font-semibold text-muted-foreground">Start Date</Label>
                  <Input
                    id="rentStart"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rentEnd" className="text-xs font-semibold text-muted-foreground">End Date</Label>
                  <Input
                    id="rentEnd"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1 select-none">
                <Checkbox
                  id="includeSetupCheck"
                  checked={includeSetup}
                  onCheckedChange={(checked) => setIncludeSetup(!!checked)}
                />
                <Label htmlFor="includeSetupCheck" className="text-sm font-medium cursor-pointer">
                  Include Professional Transport & Setup (+25,000 RWF)
                </Label>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border/20 text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span className="font-semibold text-foreground">{bookingItem.price.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span>Days Count:</span>
                  <span className="font-semibold text-foreground">
                    {Math.max(1, Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
                {includeSetup && (
                  <div className="flex justify-between">
                    <span>Setup & Transport:</span>
                    <span className="font-semibold text-foreground">25,000 RWF</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-extrabold text-foreground">
                  <span>Estimated Net:</span>
                  <span className="text-secondary">
                    {((bookingItem.price * Math.max(1, Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))) + (includeSetup ? 25000 : 0)).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <Button onClick={handleBookRental} className="btn-gold w-full py-6 rounded-xl font-bold gap-2">
                Add to Unified Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RentalsPage;
