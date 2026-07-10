import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Ticket, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

const mockEvents = [
  {
    id: "e1",
    title: "Kigali Jazz Junction - Summer Edition",
    date: "Aug 15, 2026",
    location: "Kigali Conference and Exhibition Center (KCEV)",
    price: 15000,
    image: concertImg,
    tag: "Concert",
    isFeatured: true
  },
  {
    id: "e2",
    title: "Rwanda Corporate Tech Summit 2026",
    date: "Sep 05, 2026",
    location: "Kigali Convention Centre (KCC)",
    price: 50000,
    image: corporateImg,
    tag: "Corporate",
    isFeatured: true
  },
  {
    id: "e3",
    title: "Hillsong London Live in Kigali",
    date: "Nov 12, 2026",
    location: "BK Arena",
    price: 10000,
    image: heroImg,
    tag: "Concert",
    isFeatured: false
  },
  {
    id: "e4",
    title: "East African Cultural Festival",
    date: "Dec 20, 2026",
    location: "Amahoro Stadium Outdoor Grounds",
    price: 5000,
    image: concertImg,
    tag: "Show",
    isFeatured: false
  }
];

const EventsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>(mockEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("events")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((ev: any) => {
            let tag = "Show";
            const lowerTitle = ev.title.toLowerCase();
            if (lowerTitle.includes("conference") || lowerTitle.includes("corporate")) tag = "Corporate";
            else if (lowerTitle.includes("worship") || lowerTitle.includes("choir")) tag = "Concert";

            return {
              id: ev.id,
              title: ev.title,
              date: ev.date,
              location: ev.location,
              price: ev.price,
              image: ev.image_url || heroImg,
              tag: tag,
              isFeatured: ev.is_featured
            };
          });
          setEvents(mapped);
        }
        setLoading(false);
      });
  }, []);

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

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
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Events</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-5">Upcoming Events</h1>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg font-medium">
            Discover and book tickets for the best events across Rwanda.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-secondary focus:ring-secondary/50 rounded-xl"
            />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Loading upcoming events...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <div key={i} className="card-premium overflow-hidden group">
                  <div className="relative h-52 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                    <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">{event.tag}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground text-lg mb-3">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-secondary" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-secondary" /> {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-secondary" /> {event.seats ? event.seats.toLocaleString() : "0"} seats
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">From {event.price} RWF</span>
                      <Button 
                        size="sm" 
                        className="btn-gold text-xs py-1.5 px-3 gap-1"
                        onClick={() => addToCart({
                          id: event.id,
                          type: "ticket",
                          name: event.title,
                          price: event.price,
                          image: event.image
                        })}
                      >
                        <Ticket className="h-3 w-3" /> Buy Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8 col-span-3">No upcoming events found.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
