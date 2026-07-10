import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaMapPin, FaCalendar, FaTicket, FaArrowRight } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";

const mockFeaturedEvents = [
  {
    id: "e1",
    title: "Kigali Jazz Junction - Summer Edition",
    date: "Aug 15, 2026",
    location: "Kigali Conference and Exhibition Center (KCEV)",
    price: "15,000 RWF",
    rawPrice: 15000,
    image: concertImg,
    tag: "Concert"
  },
  {
    id: "e2",
    title: "Rwanda Corporate Tech Summit 2026",
    date: "Sep 05, 2026",
    location: "Kigali Convention Centre (KCC)",
    price: "50,000 RWF",
    rawPrice: 50000,
    image: corporateImg,
    tag: "Conference"
  }
];

export function FeaturedEvents() {
  const [events, setEvents] = useState<any[]>(mockFeaturedEvents);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { addToCart } = useCart();

  const isDark = theme === "dark";

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("is_featured", true)
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((ev: any) => {
            let tag = "Show";
            const lowerTitle = ev.title.toLowerCase();
            if (lowerTitle.includes("festival")) tag = "Festival";
            else if (lowerTitle.includes("summit") || lowerTitle.includes("conference") || lowerTitle.includes("tech")) tag = "Conference";
            else if (lowerTitle.includes("gala") || lowerTitle.includes("dinner")) tag = "Gala";
            else if (lowerTitle.includes("wedding")) tag = "Wedding";
            else if (lowerTitle.includes("concert") || lowerTitle.includes("jazz") || lowerTitle.includes("night") || lowerTitle.includes("live")) tag = "Concert";

            return {
              id: ev.id,
              title: ev.title,
              date: new Date(ev.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              }),
              location: ev.location || "TBD",
              price: parseFloat(ev.ticket_price || ev.price).toLocaleString() + " RWF",
              rawPrice: parseFloat(ev.ticket_price || ev.price) || 15000,
              image: ev.image_url || "/assets/hero-event.jpg",
              tag
            };
          });
          setEvents(mapped);
        }
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
                <div className="relative h-52 w-full overflow-hidden bg-muted/20">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-white bg-secondary px-3 py-1 rounded-full">
                      {event.tag}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between pl-8">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-secondary transition-colors duration-300">
                      {event.title}
                    </h3>
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
                        <FaCalendar className="h-3.5 w-3.5 text-secondary shrink-0" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-muted-foreground">
                        <FaMapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/40">
                    <span className="font-extrabold text-foreground text-sm">From {event.price}</span>
                    <Button 
                      size="sm" 
                      className="btn-gold text-xs py-2 px-4 gap-1.5 font-bold rounded-lg shadow-md shadow-secondary/10"
                      onClick={() => addToCart({
                        id: event.id,
                        type: "ticket",
                        name: event.title,
                        price: event.rawPrice || 15000,
                        image: event.image
                      })}
                    >
                      <FaTicket className="h-3.5 w-3.5" /> Buy Ticket
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8 col-span-3">No featured events at the moment.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
