import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Map, Ticket, Users, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import heroImg from "@/assets/hero-event.jpg";

const EventsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { addToCart } = useCart();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        setFetchError("Unable to load events from the server.");
        setEvents([]);
      } else if (data && data.length > 0) {
        const mapped = data.map((ev: any) => {
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

          return {
            id: ev.id,
            title: ev.title,
            date: formattedDate,
            time: formattedTime,
            location: ev.location || "Kigali Rwanda",
            venue: ev.venue || "Kigali",
            price: minPrice,
            image: resolveMediaUrl(ev.image_url, heroImg),
            tag: ev.category || "Event",
            status: ev.status || "Upcoming",
            isFeatured: ev.is_featured,
          };
        });
        setEvents(mapped);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      setFetchError("Failed to connect to the events service. Please verify your connection.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      {/* Hero */}
      <section className="relative text-white pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
        {/* Abstract Geometric Background Design */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #050814 0%, #0c1730 100%)"
                : "linear-gradient(135deg, #0a1124 0%, #15203d 100%)",
            }}
          />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Curated Experiences
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Upcoming <span className="text-secondary">Events & Shows</span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base mb-8">
            Experience Kigali's most anticipated festivals, concerts, and leadership summits with instant digital ticketing.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by event title, venue, or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-6 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 backdrop-blur-md"
            />
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm font-semibold">Loading upcoming events...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((event) => (
                <Link 
                  key={event.id} 
                  to={`/events/${event.id}`}
                  className="block group"
                >
                  <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group h-full">
                    {/* Poster Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy" 
                      />
                      <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        {event.tag}
                      </div>
                      {event.status && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {event.status}
                        </div>
                      )}
                    </div>

                    {/* Card Content: Name, Day & Date, Time, Location, Name of place */}
                    <div className="p-6 space-y-4">
                      {/* Event Name */}
                      <h3 className="font-black text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors text-xl tracking-tight uppercase">
                        {event.title}
                      </h3>

                      {/* Metadata Grid: Day & Date, Time, Location, Name of place */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-2 text-xs sm:text-sm font-medium">
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
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 px-6 text-center rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md max-w-xl mx-auto my-6">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                    {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <Calendar className="h-8 w-8 text-secondary" />}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {search 
                      ? "No Matching Events Found" 
                      : fetchError 
                        ? "Events Service Unavailable" 
                        : "No Upcoming Events Scheduled"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {search
                      ? `We couldn't find any events matching "${search}". Please try another keyword or clear the search filter.`
                      : fetchError
                        ? "We're currently unable to load the event schedule. Please verify your connection or reach out to our team."
                        : "Our upcoming festival and concert calendar is being updated. Check back shortly or contact our event production team to host or produce your next gathering."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {search ? (
                      <Button variant="outline" onClick={() => setSearch("")} className="btn-gold">
                        Clear Search Filter
                      </Button>
                    ) : (
                      <>
                        <Link to="/contact">
                          <Button className="btn-gold">Contact Event Team</Button>
                        </Link>
                        <Button variant="outline" onClick={() => fetchEvents()} className="gap-2">
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
    </Layout>
  );
};

export default EventsPage;
