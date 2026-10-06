import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Minus, 
  Plus, 
  Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { TicketCheckoutModal } from "@/components/events/TicketCheckoutModal";
import { CalendarModal } from "@/components/events/CalendarModal";
import { AlertCircle, RefreshCw } from "lucide-react";
import heroImg from "@/assets/hero-event.jpg";

export default function Ticketing() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [tierQuantities, setTierQuantities] = useState<{ [id: string]: number }>({});
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<any>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        setFetchError("Unable to retrieve ticketed events.");
        setEvents([]);
      } else if (data && data.length > 0) {
        setEvents(data);
        const ryla = data.find((e: any) => e.title.toLowerCase().includes("ryla"));
        const initialId = ryla ? ryla.id : data[0].id;
        setSelectedEventId(initialId);
      } else {
        setEvents([]);
      }
    } catch {
      setFetchError("Unable to connect to ticketing service.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const tiers = activeEvent?.ticket_tiers && Array.isArray(activeEvent.ticket_tiers) && activeEvent.ticket_tiers.length > 0
    ? activeEvent.ticket_tiers
    : [
        {
          id: "tier-early",
          name: "EARLY BIRD TICKET",
          price: parseFloat(activeEvent?.ticket_price) || 5000,
          description: "General admission pass with workshop access",
        },
        {
          id: "tier-gate",
          name: "GATE TICKET",
          price: (parseFloat(activeEvent?.ticket_price) || 5000) * 4,
          description: "Full pass on festival entry days",
        },
      ];

  const handleQtyChange = (tierId: string, delta: number) => {
    setTierQuantities((prev) => {
      const cur = prev[tierId] || 1;
      return { ...prev, [tierId]: Math.max(1, cur + delta) };
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-slate-950 text-white pt-28 md:pt-36 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,165,233,0.18),transparent_65%)]" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Instant Digital Ticketing
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-3 font-heading tracking-tight">
            Select & Book Your Event Tickets
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-sm md:text-base">
            Choose your preferred ticket tier, adjust quantities, and instantly receive verified QR passes with MoMo or card.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm font-semibold">Loading ticketing hub...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="max-w-xl mx-auto py-16 px-6 text-center rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
              {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <TicketIcon className="h-8 w-8 text-secondary" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {fetchError ? "Ticketing Service Unavailable" : "No Active Ticket Sales"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
              {fetchError
                ? "We are currently having trouble reaching the ticketing server. Please check your internet connection or try again."
                : "There are currently no tickets on sale for upcoming events. Check back soon or visit our events calendar for announcements."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/events">
                <Button className="btn-gold">Browse Events</Button>
              </Link>
              <Button variant="outline" onClick={() => loadEvents()} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
              <Link to="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Event Selector Pill Bar */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                Choose Event:
              </span>
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedEventId === ev.id
                      ? "bg-secondary text-white shadow-md shadow-secondary/20 scale-[1.02]"
                      : "bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                  }`}
                >
                  {ev.title}
                </button>
              ))}
            </div>

            {activeEvent && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Event Summary Left Card */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                  <div className="aspect-4/3 relative overflow-hidden bg-slate-950">
                    <img
                      src={resolveMediaUrl(activeEvent.image_url, heroImg)}
                      alt={activeEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      {activeEvent.category || "Featured"}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-black text-secondary uppercase tracking-tight">
                      {activeEvent.title}
                    </h3>

                    <div className="space-y-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2.5 text-foreground/80 font-medium">
                        <Calendar className="w-4 h-4 text-secondary shrink-0" />
                        <span>
                          {new Date(activeEvent.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground/80 font-medium">
                        <MapPin className="w-4 h-4 text-secondary shrink-0" />
                        <span>{activeEvent.location || "Kigali Rwanda"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground/80 font-medium">
                        <Building2 className="w-4 h-4 text-secondary shrink-0" />
                        <span>{activeEvent.venue || "UR Gikondo Campus"}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCalendarModal(true)}
                        className="text-xs font-bold rounded-xl"
                      >
                        Add to Calendar
                      </Button>

                      <Link to={`/events/${activeEvent.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-primary hover:underline gap-1"
                        >
                          Full Details <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Ticket Tiers Right Column matching Template */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="border-b border-border pb-3 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <TicketIcon className="w-5 h-5 text-primary" /> Available Ticket Tiers
                    </h3>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Choose quantity and book
                    </span>
                  </div>

                  <div className="space-y-4">
                    {tiers.map((tier: any) => {
                      const qty = tierQuantities[tier.id] || 1;
                      const subtotal = tier.price * qty;

                      return (
                        <div
                          key={tier.id}
                          className="rounded-2xl border-2 border-secondary/30 hover:border-secondary bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs"
                        >
                          <div className="space-y-1 max-w-sm">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                              Tier
                            </span>
                            <h4 className="font-extrabold text-foreground text-lg">
                              {tier.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {tier.description || "General event entry"}
                            </p>
                            <div className="text-2xl font-black text-secondary pt-1">
                              {tier.price.toLocaleString()} FRW
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-border rounded-lg bg-muted/20">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(tier.id, -1)}
                                disabled={qty <= 1}
                                className="p-1.5 hover:bg-muted text-foreground disabled:opacity-40"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 font-bold text-sm text-foreground">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(tier.id, 1)}
                                className="p-1.5 hover:bg-muted text-foreground"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <span className="text-xs text-muted-foreground font-semibold">
                              Total: <span className="text-foreground font-bold">{subtotal.toLocaleString()} FRW</span>
                            </span>

                            {/* Buy Now */}
                            <Button
                              onClick={() => setSelectedTierForCheckout(tier)}
                              className="btn-gold text-white font-extrabold text-xs px-6 py-5 rounded-xl shadow-md transition-all active:scale-95"
                            >
                              BUY NOW
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </section>

      {/* Calendar Modal */}
      {showCalendarModal && activeEvent && (
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          event={activeEvent}
        />
      )}

      {/* Ticket Checkout Modal */}
      {selectedTierForCheckout && activeEvent && (
        <TicketCheckoutModal
          isOpen={!!selectedTierForCheckout}
          onClose={() => setSelectedTierForCheckout(null)}
          event={activeEvent}
          selectedTier={selectedTierForCheckout}
          initialQuantity={tierQuantities[selectedTierForCheckout.id] || 1}
        />
      )}
    </Layout>
  );
}
