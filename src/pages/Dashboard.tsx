import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Ticket, Wrench, User, LogOut, Edit2, Save, X, QrCode, Calendar as CalendarIcon, Printer, ShieldCheck, ArrowRight, Clock, Truck, FileText, Eye } from "lucide-react";
import { CalendarModal } from "@/components/events/CalendarModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DashboardPage = () => {
  const { user, profile, role, signOut } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [activeQrTicket, setActiveQrTicket] = useState<any>(null);
  const [calendarEvent, setCalendarEvent] = useState<any>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone || "" });
    }
  }, [profile]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, events(title, date), equipment(name)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
  };

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("tickets")
      .select("*, events(title, date, location)")
      .eq("user_id", user!.id)
      .order("purchased_at", { ascending: false });
    setTickets(data || []);
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone, updated_at: new Date().toISOString() })
      .eq("id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditing(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "Approved" || status === "Completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Admin Banner */}
          {role === "admin" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-transparent border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-sm">Administrator Account Detected</h4>
                  <p className="text-xs text-muted-foreground">Access the complete live operations, event productions, and bookings control center.</p>
                </div>
              </div>
              <Link to="/admin">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm">
                  <span>Open Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {profile?.full_name || "User"}!
                </h1>
                <p className="text-muted-foreground text-sm">Manage your bookings, tickets, and profile</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="card-premium p-5">
              <Calendar className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div className="card-premium p-5">
              <Ticket className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              <p className="text-xs text-muted-foreground">Tickets</p>
            </div>
            <div className="card-premium p-5">
              <Wrench className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {bookings.filter((b) => b.booking_type === "equipment").length}
              </p>
              <p className="text-xs text-muted-foreground">Equipment Rentals</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bookings */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" /> My Bookings
              </h2>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => {
                    const isRental = b.booking_type === "equipment";
                    const itemName = isRental 
                      ? (b.equipment_name || b.equipment?.name || "Equipment Rental")
                      : b.booking_type === "service"
                      ? (b.service_name || "Service Production Inquiry")
                      : (b.events?.title || "Event Ticket");

                    return (
                      <div key={b.id} className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-2 hover:border-secondary/30 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {isRental && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/20">
                                  Rental
                                </span>
                              )}
                              <p className="font-bold text-foreground text-sm">
                                {itemName}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mt-0.5">
                              {b.booking_type === "service" 
                                ? `Service Inquiry ${b.start_date ? `• ${b.start_date}` : ""}` 
                                : b.booking_type === "equipment"
                                ? `${b.rental_days || 1} day(s) equipment rental`
                                : "Event Ticket"}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor(b.status)}`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Rental specific timeline and notes */}
                        {isRental && (
                          <div className="text-xs space-y-1.5 pt-1 border-t border-border/30 text-muted-foreground">
                            {b.start_date && (
                              <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                                <CalendarIcon className="h-3.5 w-3.5 text-secondary shrink-0" />
                                <span>{b.start_date} → {b.end_date || b.start_date}</span>
                                {b.start_time && (
                                  <span className="text-muted-foreground text-[11px]">({b.start_time} – {b.end_time || ""})</span>
                                )}
                              </div>
                            )}

                            {b.include_setup && (
                              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Truck className="h-3 w-3 shrink-0" />
                                <span>Transport & Technical Setup Requested</span>
                              </div>
                            )}

                            {b.notes && (
                              <div className="p-2 rounded bg-muted/50 border border-border/20 text-[11px] italic text-foreground">
                                <FileText className="h-3 w-3 text-secondary inline mr-1" />
                                "{b.notes}"
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-1 flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">
                            {isRental ? (
                              <span className="text-secondary font-bold text-[11px]">Rental Reservation</span>
                            ) : b.amount ? (
                              `${Number(b.amount).toLocaleString()} RWF`
                            ) : (
                              "Service Inquiry"
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBookingDetail(b)}
                            className="h-7 text-xs font-bold text-secondary hover:text-secondary gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tickets */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-secondary" /> My Tickets
              </h2>
              {tickets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tickets yet.</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground text-sm truncate max-w-[200px]">
                          {t.events?.title || "Event Ticket"}
                        </p>
                        <span className="text-[10px] font-black uppercase bg-secondary/15 text-secondary border border-secondary/30 px-2.5 py-0.5 rounded-full">
                          {t.ticket_type}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          {t.events?.date && new Date(t.events.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                        {t.events?.venue && <p className="text-foreground/80 font-medium">{t.events.venue}</p>}
                        <p className="font-mono text-[11px] text-foreground font-semibold">
                          Code: {t.ticket_code} {t.quantity > 1 ? `(${t.quantity} Passes)` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveQrTicket(t)}
                          className="text-xs font-bold h-8 rounded-lg gap-1.5 flex-1"
                        >
                          <QrCode className="h-3.5 w-3.5 text-secondary" /> View Pass
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCalendarEvent(t.events || { title: t.events?.title, date: t.events?.date })}
                          className="text-xs font-bold h-8 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Add to Calendar"
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="card-premium p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" /> My Profile
                </h2>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="btn-gold" onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  {editing ? (
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  ) : (
                    <p className="text-foreground font-medium">{profile?.full_name || "-"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-foreground font-medium">{profile?.email || user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  {editing ? (
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  ) : (
                    <p className="text-foreground font-medium">{profile?.phone || "-"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Modal */}
      {calendarEvent && (
        <CalendarModal
          isOpen={!!calendarEvent}
          onClose={() => setCalendarEvent(null)}
          event={calendarEvent}
        />
      )}

      {/* QR Ticket Pass Modal */}
      {activeQrTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-background text-foreground rounded-2xl p-6 shadow-2xl border border-border space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-extrabold text-foreground text-base">Digital Ticket Pass</h3>
              <button 
                onClick={() => setActiveQrTicket(null)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border-2 border-dashed border-secondary/40 bg-secondary/[0.04] p-5 text-center space-y-4">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/25">
                {activeQrTicket.ticket_type}
              </span>

              <div>
                <h4 className="font-extrabold text-lg text-foreground">
                  {activeQrTicket.events?.title || "Event Pass"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeQrTicket.events?.venue || activeQrTicket.events?.location || "Kigali Rwanda"}
                </p>
              </div>

              {/* QR representation */}
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-xs border border-gray-200 mx-auto flex items-center justify-center">
                <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="black" />
                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="black" />
                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="black" />
                  <rect x="36" y="10" width="6" height="12" fill="black" />
                  <rect x="48" y="8" width="8" height="6" fill="black" />
                  <rect x="38" y="28" width="14" height="6" fill="black" />
                  <rect x="42" y="40" width="16" height="16" fill="black" />
                  <rect x="36" y="64" width="10" height="14" fill="black" />
                  <rect x="52" y="68" width="14" height="8" fill="black" />
                  <rect x="72" y="68" width="20" height="10" fill="black" />
                </svg>
              </div>

              <div className="font-mono text-sm font-black text-foreground">
                {activeQrTicket.ticket_code}
              </div>

              <div className="text-xs text-muted-foreground">
                Quantity: <span className="font-bold text-foreground">{activeQrTicket.quantity || 1} pass(es)</span>
              </div>
            </div>

            <Button
              onClick={() => window.print()}
              className="w-full btn-gold font-bold py-5 rounded-xl gap-2"
            >
              <Printer className="h-4 w-4" /> Print / Save Pass
            </Button>
          </div>
        </div>
      )}

      {/* Booking / Rental Detail Modal */}
      <Dialog open={!!selectedBookingDetail} onOpenChange={(open) => !open && setSelectedBookingDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                selectedBookingDetail?.booking_type === "equipment" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-secondary/10 text-secondary border-secondary/20"
              }`}>
                {selectedBookingDetail?.booking_type === "equipment" ? "Equipment Rental" : selectedBookingDetail?.booking_type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(selectedBookingDetail?.status || "")}`}>
                {selectedBookingDetail?.status}
              </span>
            </div>
            <DialogTitle className="text-base font-bold text-foreground mt-1">
              {selectedBookingDetail && (
                selectedBookingDetail.booking_type === "equipment"
                  ? (selectedBookingDetail.equipment_name || selectedBookingDetail.equipment?.name || "Equipment Rental")
                  : selectedBookingDetail.booking_type === "service"
                  ? (selectedBookingDetail.service_name || "Production Service Inquiry")
                  : (selectedBookingDetail.events?.title || "Event Ticket")
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Booking Ref: {selectedBookingDetail?.id?.slice(0, 8)?.toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedBookingDetail && (
            <div className="space-y-3.5 text-xs mt-2">
              {/* Schedule and timings */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dates:</span>
                  <span className="font-semibold text-foreground">
                    {selectedBookingDetail.start_date ? `${selectedBookingDetail.start_date} → ${selectedBookingDetail.end_date || selectedBookingDetail.start_date}` : "N/A"}
                  </span>
                </div>
                {selectedBookingDetail.start_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Operating Window:</span>
                    <span className="font-semibold text-foreground">
                      {selectedBookingDetail.start_time} – {selectedBookingDetail.end_time || ""}
                    </span>
                  </div>
                )}
                {selectedBookingDetail.rental_days && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rental Duration:</span>
                    <span className="font-bold text-secondary">
                      {selectedBookingDetail.rental_days} day(s)
                    </span>
                  </div>
                )}
                {selectedBookingDetail.booking_type === "equipment" && (
                  <div className="flex justify-between items-center pt-1 border-t border-border/30">
                    <span className="text-muted-foreground">Transport & Crew:</span>
                    <span className={`font-semibold ${selectedBookingDetail.include_setup ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {selectedBookingDetail.include_setup ? "Included (On-site setup requested)" : "Self-Pickup"}
                    </span>
                  </div>
                )}
              </div>

              {/* Special Notes & Descriptions */}
              {selectedBookingDetail.notes && (
                <div className="space-y-1">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1 text-[11px]">
                    <FileText className="h-3 w-3 text-secondary" />
                    Special Requirements & Notes:
                  </span>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 italic text-foreground text-xs leading-relaxed">
                    "{selectedBookingDetail.notes}"
                  </div>
                </div>
              )}

              {/* Total Rate (Only for Non-Rentals) */}
              {selectedBookingDetail.booking_type !== "equipment" && (
                <div className="p-3 rounded-xl bg-card border border-border/40 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Estimated Amount:</span>
                  <span className="font-extrabold text-foreground text-sm">
                    {selectedBookingDetail.amount ? `${Number(selectedBookingDetail.amount).toLocaleString()} RWF` : "Quote on Request"}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedBookingDetail(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DashboardPage;
