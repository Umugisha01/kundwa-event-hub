import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  Folder, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Minus, 
  Plus, 
  Ticket as TicketIcon,
  ArrowLeft,
  Share2,
  CalendarX,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { CalendarModal } from "@/components/events/CalendarModal";
import { TicketCheckoutModal } from "@/components/events/TicketCheckoutModal";
import heroImg from "@/assets/hero-event.jpg";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity?: number;
  sold?: number;
  description?: string;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tierQuantities, setTierQuantities] = useState<{ [tierId: string]: number }>({});
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<TicketTier | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let eventData: any = null;
      if (id) {
        const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
        if (error) {
          setErrorMsg("Could not find this event or the service is temporarily unreachable.");
        } else if (data) {
          eventData = data;
        }
      } else {
        const { data, error } = await supabase.from("events").select("*").order("is_featured", { ascending: false }).limit(1);
        if (!error && data && data.length > 0) {
          eventData = data[0];
        }
      }

      if (eventData) {
        // Ensure ticket_tiers is parsed and formatted
        let tiers: TicketTier[] = [];
        if (eventData.ticket_tiers && Array.isArray(eventData.ticket_tiers) && eventData.ticket_tiers.length > 0) {
          tiers = eventData.ticket_tiers;
        } else {
          // Fallback tiers
          const basePrice = parseFloat(eventData.ticket_price) || 5000;
          tiers = [
            {
              id: "tier-early-bird",
              name: "EARLY BIRD TICKET",
              price: basePrice,
              description: "Full admission and workshop access pass",
            },
            {
              id: "tier-regular",
              name: "GATE TICKET",
              price: basePrice * 4,
              description: "Regular entry on festival/event day",
            },
          ];
        }

        eventData.ticket_tiers = tiers;
        setEvent(eventData);

        // Initialize quantity 1 for each tier
        const initialQty: { [k: string]: number } = {};
        tiers.forEach((t) => {
          initialQty[t.id] = 1;
        });
        setTierQuantities(initialQty);
      }
    } catch (err) {
      console.error("Failed to load event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (tierId: string, delta: number) => {
    setTierQuantities((prev) => {
      const current = prev[tierId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const handleBuyNow = (tier: TicketTier) => {
    setSelectedTierForCheckout(tier);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading event details...</p>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
            {errorMsg ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <CalendarX className="h-8 w-8 text-secondary" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {errorMsg ? "Event Unavailable" : "Event Not Found"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {errorMsg 
              ? "We are currently having trouble retrieving the event details. Please verify your internet connection or check back shortly."
              : "The requested event could not be found or may have concluded. Browse our upcoming calendar or contact our events team."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate("/events")} className="btn-gold">
              Browse Upcoming Events
            </Button>
            <Button variant="outline" onClick={() => fetchEvent()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Link to="/contact">
              <Button variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const startDate = new Date(event.date);
  const formattedStartDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endDate = event.end_date ? new Date(event.end_date) : null;
  const formattedEndDate = endDate
    ? endDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : formattedStartDate;
  const formattedEndTime = endDate
    ? endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "11:00 PM";

  const eventStatus = event.status || "Active";
  const isExpired = eventStatus.toLowerCase() === "expired" || (endDate && endDate < new Date());

  return (
    <Layout>
      {/* Top Banner with Dark Aesthetic & Event Title */}
      <section className="relative bg-slate-950 text-white pt-28 pb-14 md:pt-36 md:pb-16 overflow-hidden border-b border-border/20">
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity filter blur-sm scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${resolveMediaUrl(event.image_url, heroImg)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
            <Link to="/events" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Events
            </Link>
            <span>/</span>
            <span className="text-secondary truncate">{event.title}</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading">
            {event.title}
          </h1>
        </div>
      </section>

      {/* Main Content: Left Column (Poster + Tickets) & Right Column (Event Details) */}
      <section className="py-10 md:py-16 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Poster + Tickets Section */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Event Poster Card */}
              <div className="rounded-2xl overflow-hidden border border-border/80 shadow-xl bg-card">
                <img
                  src={resolveMediaUrl(event.image_url, heroImg)}
                  alt={event.title}
                  className="w-full h-auto max-h-[600px] object-cover md:object-contain bg-slate-950"
                  loading="eager"
                />
              </div>

              {/* Event Description */}
              {event.description && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">About This Event</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Tickets Section matching Template Image 3 */}
              <div className="space-y-6 pt-4">
                <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <TicketIcon className="w-6 h-6 text-primary" /> Tickets
                  </h2>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {event.ticket_tiers.length} Ticket Option{event.ticket_tiers.length > 1 ? "s" : ""} Available
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  {event.ticket_tiers.map((tier: TicketTier) => {
                    const qty = tierQuantities[tier.id] || 1;
                    const tierTotal = tier.price * qty;

                    return (
                      <div
                        key={tier.id}
                        className="flex-1 min-w-0 rounded-2xl border-2 border-secondary/30 bg-card p-5 flex flex-col justify-between hover:border-secondary transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        {/* Subtle top indicator */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-primary" />

                        <div className="space-y-3 text-center">
                          <h3 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-wider min-h-[2.5rem] flex items-center justify-center">
                            {tier.name}
                          </h3>

                          {/* Price styled prominently in brand secondary */}
                          <div className="font-black text-2xl lg:text-3xl text-secondary tracking-tight">
                            {tier.price.toLocaleString()}FRW
                          </div>
                        </div>

                        {/* Quantity controls & Buy Now Button */}
                        <div className="pt-6 space-y-4">
                          <div className="flex items-center justify-between px-1 text-xs">
                            <span className="font-semibold text-muted-foreground">Quantity:</span>
                            <div className="flex items-center border border-border rounded-lg bg-muted/20">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(tier.id, -1)}
                                disabled={qty <= 1}
                                className="p-1.5 hover:bg-muted text-foreground disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 font-bold text-sm text-foreground">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(tier.id, 1)}
                                className="p-1.5 hover:bg-muted text-foreground transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {qty > 1 && (
                            <div className="flex justify-between items-center text-xs font-semibold px-1 text-muted-foreground">
                              <span>Total ({qty} tickets):</span>
                              <span className="font-bold text-foreground text-xs">
                                {tierTotal.toLocaleString()} FRW
                              </span>
                            </div>
                          )}

                          <Button
                            onClick={() => handleBuyNow(tier)}
                            className="w-full py-4 rounded-xl font-black text-xs sm:text-sm tracking-wide btn-gold shadow-md transition-all active:scale-[0.98]"
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

            {/* Right Column: Event Details Sidebar Card matching Template Images 2 & 3 */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl space-y-6">
                <h2 className="text-lg font-bold text-foreground border-b border-border/60 pb-3">
                  Event Details
                </h2>

                <div className="space-y-4 text-xs md:text-sm divide-y divide-border/40">
                  
                  {/* START DATE */}
                  <div className="pt-2 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        START DATE
                      </span>
                      <span className="font-semibold text-foreground">
                        {formattedStartDate} {formattedStartTime}
                      </span>
                    </div>
                  </div>

                  {/* END DATE */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <CalendarX className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        END DATE
                      </span>
                      <span className="font-semibold text-foreground">
                        {formattedEndDate} {formattedEndTime}
                      </span>
                    </div>
                  </div>

                  {/* DOOR TIME */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        DOOR TIME
                      </span>
                      <span className="font-semibold text-foreground">
                        {event.door_time || "4:00 PM"}
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        STATUS
                      </span>
                      <span className={`font-semibold capitalize ${
                        isExpired ? "text-amber-500" : "text-secondary"
                      }`}>
                        {eventStatus}
                      </span>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        LOCATION
                      </span>
                      <span className="font-semibold text-foreground">
                        {event.location || "Kigali Rwanda"}
                      </span>
                    </div>
                  </div>

                  {/* VENUE */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        VENUE
                      </span>
                      <span className="font-semibold text-foreground">
                        {event.venue || "UR Gikondo Campus"}
                      </span>
                    </div>
                  </div>

                  {/* ORGANIZER */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        ORGANIZER
                      </span>
                      <span className="font-semibold text-foreground uppercase">
                        {event.organizer || "ROTARY CLUB KIGALI VIRUNGA"}
                      </span>
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        CATEGORY
                      </span>
                      <span className="font-semibold text-foreground uppercase">
                        {event.category || "FESTIVAL"}
                      </span>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="pt-3 flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-secondary/15 text-secondary shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        PHONE
                      </span>
                      <a
                        href={`tel:${event.phone || "+250789808030"}`}
                        className="font-semibold text-secondary hover:underline"
                      >
                        {event.phone || "+250789808030"}
                      </a>
                    </div>
                  </div>

                </div>

                {/* ADD TO CALENDAR Button matching template with website theme */}
                <div className="pt-4 border-t border-border/60">
                  <Button
                    onClick={() => setShowCalendarModal(true)}
                    className="w-full py-6 rounded-xl font-bold tracking-wider text-sm btn-gold shadow-lg transition-all"
                  >
                    ADD TO CALENDAR
                  </Button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          event={event}
        />
      )}

      {/* Ticket Checkout Modal */}
      {selectedTierForCheckout && (
        <TicketCheckoutModal
          isOpen={!!selectedTierForCheckout}
          onClose={() => setSelectedTierForCheckout(null)}
          event={event}
          selectedTier={selectedTierForCheckout}
          initialQuantity={tierQuantities[selectedTierForCheckout.id] || 1}
          onSuccess={() => fetchEvent()}
        />
      )}
    </Layout>
  );
}
