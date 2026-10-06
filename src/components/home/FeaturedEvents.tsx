import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Map, Ticket, CalendarX, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

export function FeaturedEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { addToCart } = useCart();

  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    supabase
      .from("events")
      .select("*")
      .eq("is_featured", true)
      .limit(3)
      .then(async ({ data, error }) => {
        if (error) {
          setFetchError("Unable to retrieve featured events.");
          setEvents([]);
          setLoading(false);
          return;
        }

        let eventList = data || [];
        // If no featured events, fall back to any active upcoming events
        if (eventList.length === 0) {
          const { data: allData } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true })
            .limit(3);
          if (allData && allData.length > 0) {
            eventList = allData;
          }
        }

        if (eventList.length > 0) {
          const mapped = eventList.map((ev: any) => {
            const evDate = new Date(ev.date || Date.now());
            const formattedDate = evDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const formattedTime = evDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            let minPrice = parseFloat(ev.ticket_price) || 0;
            if (ev.ticket_tiers && Array.isArray(ev.ticket_tiers) && ev.ticket_tiers.length > 0) {
              const prices = ev.ticket_tiers.map((t: any) => t.price || 0);
              minPrice = Math.min(...prices);
            }

            let fallbackImage = heroImg;
            const lowerTitle = (ev.title || "").toLowerCase();
            if (lowerTitle.includes("jazz") || lowerTitle.includes("concert")) {
              fallbackImage = concertImg;
            } else if (lowerTitle.includes("tech") || lowerTitle.includes("summit") || lowerTitle.includes("corporate")) {
              fallbackImage = corporateImg;
            }

            return {
              id: ev.id,
              title: ev.title,
              date: formattedDate,
              time: ev.door_time || formattedTime,
              location: ev.location || "Kigali Rwanda",
              venue: ev.venue || "UR Gikondo Campus",
              price: minPrice.toLocaleString() + " RWF",
              image: resolveMediaUrl(ev.image_url, fallbackImage),
              tag: ev.category || "Festival",
              status: ev.status || "Active",
            };
          });
          setEvents(mapped);
        } else {
          setEvents([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Unable to connect to events service.");
        setEvents([]);
        setLoading(false);
      });
  }, []);

  const cardBorder = isDark
    ? `1px solid rgba(255, 255, 255, 0.08)`
    : `1px solid rgba(0, 0, 0, 0.06)`;

  const cardShadow = isDark
    ? `0 12px 40px rgba(0, 0, 0, 0.4)`
    : `0 8px 30px rgba(15, 23, 42, 0.04)`;

  const cardBg = isDark
    ? "rgba(10, 15, 30, 0.85)"
    : "rgba(255, 255, 255, 0.85)";

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-secondary font-bold text-xs uppercase tracking-[0.25em]">Upcoming</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
              Featured <span className="text-secondary">Events</span>
            </h2>
          </div>
          <Link to="/events">
            <Button variant="outline" className="rounded-xl font-bold border-border/80 hover:bg-secondary/10 hover:text-secondary transition-all">
              View All Events
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading featured events...</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {events.map((event, i) => (
              <div
                key={event.id || i}
                className="group relative overflow-hidden rounded-[24px] border backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between animate-fade-in w-full md:max-w-[380px]"
                style={{
                  background: cardBg,
                  border: cardBorder,
                  boxShadow: cardShadow,
                  animationDelay: `${i * 0.15}s`
                }}
              >
                {/* Vertical Accent Bar */}
                <div
                  className="absolute left-0 top-8 w-[4px] h-10 rounded-r-full transition-all duration-500 group-hover:h-16 z-20"
                  style={{
                    background: "hsl(var(--secondary))",
                    boxShadow: "0 0 12px hsl(var(--secondary))",
                  }}
                />

                {/* Event Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e: any) => {
                      // Fallback if URL fails to load
                      const lower = (event.title || "").toLowerCase();
                      if (lower.includes("jazz") || lower.includes("concert")) {
                        e.currentTarget.src = concertImg;
                      } else if (lower.includes("tech") || lower.includes("summit") || lower.includes("corporate")) {
                        e.currentTarget.src = corporateImg;
                      } else {
                        e.currentTarget.src = heroImg;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-secondary px-3 py-1 rounded-full shadow-md">
                      {event.tag}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {event.status && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        {event.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Details: Name, Day & Date, Time, Location, Name of place */}
                <div className="p-6 flex-1 flex flex-col justify-between pl-8 space-y-4">
                  <div>
                    <Link to={`/events/${event.id}`}>
                      <h3 className="font-black text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors duration-300 text-xl tracking-tight uppercase mb-4">
                        {event.title}
                      </h3>
                    </Link>

                    {/* Metadata Grid matching Events page */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-2 text-xs sm:text-sm font-medium mb-4">
                      {/* Day and Date */}
                      <div className="flex items-center gap-2 text-foreground/85">
                        <Calendar className="h-4 w-4 text-secondary shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-foreground/85">
                        <Clock className="h-4 w-4 text-secondary shrink-0" />
                        <span>{event.time}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-foreground/85">
                        <MapPin className="h-4 w-4 text-secondary shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      {/* Name of Place (Venue) */}
                      <div className="flex items-center gap-2 text-foreground/85">
                        <Map className="h-4 w-4 text-secondary shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="pt-4 border-t border-border/40">
                    <Link to={`/events/${event.id}`} className="block w-full">
                      <Button 
                        size="sm" 
                        className="w-full btn-gold text-xs py-2.5 px-4 gap-1.5 font-bold rounded-lg shadow-md shadow-secondary/10"
                      >
                        <Ticket className="h-3.5 w-3.5" /> Buy Ticket
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="w-full max-w-xl mx-auto py-12 px-6 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md text-center">
                <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                  {fetchError ? <AlertCircle className="h-7 w-7 text-amber-500" /> : <Calendar className="h-7 w-7 text-secondary" />}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {fetchError ? "Events Service Unavailable" : "Upcoming Experiences In Preparation"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  {fetchError
                    ? "We're currently unable to load the event highlights. Please check back shortly or connect with our team directly."
                    : "Our curated calendar of festivals, concerts, and leadership summits is being refreshed. Stay tuned or get in touch to produce your next event."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link to="/events">
                    <Button variant="outline" className="btn-gold gap-1.5">
                      Explore All Events <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline">
                      Contact Team
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
