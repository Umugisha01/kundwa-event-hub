import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  TrendingUp, Calendar, Ticket, Wrench, Users, DollarSign,
  CheckCircle2, Clock, ArrowUpRight, QrCode, Printer,
  Calendar as CalendarIcon, Edit3, Save, X, Search,
  Sparkles, Layers, Eye, RefreshCw, AlertCircle, ArrowRight,
  ShieldCheck, FileText, Mail, Phone, ExternalLink, MapPin
} from "lucide-react";
import { CalendarModal } from "@/components/events/CalendarModal";

interface AdminDashboardProps {
  onNavigateTab?: (tabId: string) => void;
}

export function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const { user, profile } = useAuth();
  
  // Platform statistics & data
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [siteStats, setSiteStats] = useState<any>({
    events_produced: 520,
    attendees_served: 125000,
    years_experience: 12,
    countries_reached: 6,
  });

  // Personal admin data
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [activeQrTicket, setActiveQrTicket] = useState<any>(null);
  const [calendarEvent, setCalendarEvent] = useState<any>(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Site stats quick editing
  const [editingStats, setEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState<any>({});
  const [savingStats, setSavingStats] = useState(false);

  // Table search & filter
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch site statistics
      const statsRes = await supabase.from("site_statistics").select("*").single();
      if (statsRes.data) {
        setSiteStats(statsRes.data);
        setStatsForm(statsRes.data);
      }

      // 2. Fetch all events
      const eventsRes = await supabase.from("events").select("*").order("date", { ascending: true });
      if (eventsRes.data) setEvents(eventsRes.data);

      // 3. Fetch all bookings
      const bookingsRes = await supabase
        .from("bookings")
        .select("*, profiles(full_name, email), events(title, ticket_price), equipment(name)")
        .order("created_at", { ascending: false });
      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
        if (user) {
          setMyBookings(bookingsRes.data.filter((b: any) => b.user === user.id || b.user_id === user.id));
        }
      }

      // 4. Fetch all tickets
      const ticketsRes = await supabase
        .from("tickets")
        .select("*, events(title, date, location, venue)")
        .order("purchased_at", { ascending: false });
      if (ticketsRes.data) {
        setTickets(ticketsRes.data);
        if (user) {
          setMyTickets(ticketsRes.data.filter((t: any) => t.user === user.id || t.user_id === user.id));
        }
      }

      // 5. Fetch equipment inventory
      const equipRes = await supabase.from("equipment").select("*");
      if (equipRes.data) setEquipment(equipRes.data);

      // 6. Fetch contact inquiries
      const contactRes = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (contactRes.data) setContacts(contactRes.data);

    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: "Profile updated successfully" });
      setEditingProfile(false);
    } catch (err: any) {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Site Stats Quick Save
  const handleSaveStats = async () => {
    setSavingStats(true);
    try {
      const { id, ...rest } = statsForm;
      const { error } = await supabase
        .from("site_statistics")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id || siteStats.id);

      if (error) throw error;
      setSiteStats(statsForm);
      setEditingStats(false);
      toast({ title: "Platform statistics updated" });
    } catch (err: any) {
      toast({ title: "Failed to update stats", description: err.message, variant: "destructive" });
    } finally {
      setSavingStats(false);
    }
  };

  // Calculated KPI Metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0) +
    tickets.reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0);

  const totalTicketsSold = tickets.reduce((sum, t) => sum + (parseInt(t.quantity) || 1), 0) +
    events.reduce((sum, e) => sum + (parseInt(e.tickets_sold) || 0), 0);

  const activeEventsCount = events.filter((e) => e.status === "Active" || e.status === "Upcoming").length;
  const availableEquipmentCount = equipment.filter((eq) => eq.status === "Available" || !eq.status).length;
  const pendingBookingsCount = bookings.filter((b) => b.status === "Pending").length;

  // Filtered recent activities for the template-style table
  const filteredBookings = bookings.filter((b) => {
    const q = tableSearch.toLowerCase();
    const customer = (b.profiles?.full_name || b.profiles?.email || "Guest Client").toLowerCase();
    const item = (b.booking_type === "event" ? b.events?.title : b.equipment?.name || "Service").toLowerCase();
    const matchesSearch = customer.includes(q) || item.includes(q);
    const matchesFilter = tableFilter === "all" || b.status?.toLowerCase() === tableFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── 1. Top Executive Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-60 h-60 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations & Event Control Center
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {profile?.full_name || user?.email?.split("@")[0] || "Director"}! 👋
            </h2>
            <p className="text-slate-200 text-xs md:text-sm leading-relaxed">
              Real-time synchronization across ticketing passes, concert staging, audio rentals, and client inquiries.
            </p>
          </div>

          {/* Quick Action Shortcut Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => onNavigateTab?.("events")}
              className="bg-white hover:bg-slate-100 text-blue-900 font-bold rounded-xl text-xs h-10 px-4 shadow-md gap-1.5 transition-transform active:scale-95"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Manage Events</span>
            </Button>

            <Button
              onClick={() => onNavigateTab?.("bookings")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs h-10 px-4 backdrop-blur-md gap-1.5 transition-transform active:scale-95"
            >
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>Bookings ({pendingBookingsCount})</span>
            </Button>

            <Button
              onClick={loadDashboardData}
              variant="ghost"
              size="icon"
              title="Refresh Data"
              className="h-10 w-10 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Flagship KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground tracking-tight">
              {totalRevenue.toLocaleString()} <span className="text-sm font-bold text-muted-foreground">FRW</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tickets & Attendees
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground tracking-tight">
              {totalTicketsSold.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>{tickets.length} confirmed orders</span>
            </div>
          </div>
        </div>

        {/* Card 3: Events In Production */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Event Productions
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground tracking-tight">
              {activeEventsCount} <span className="text-sm font-medium text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{events.length} total scheduled</span>
            </div>
          </div>
        </div>

        {/* Card 4: Equipment Inventory */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Equipment Rentals
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-foreground tracking-tight">
              {availableEquipmentCount} / {equipment.length || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gear in operational readiness</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Section: Upcoming Events Spotlight & Quick Config ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 cols): Upcoming Events in Production */}
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-extrabold text-foreground text-base tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Featured Event Productions
              </h3>
              <p className="text-xs text-muted-foreground">Upcoming festivals, concerts, and leadership summits</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab?.("events")}
              className="text-xs font-bold rounded-xl h-8 gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="group relative rounded-xl border border-border/60 p-4 hover:border-blue-500/50 hover:shadow-md transition-all bg-muted/10 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {ev.category || "Event"}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {ev.status || "Upcoming"}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                    {ev.title}
                  </h4>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      <span>{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{ev.venue || ev.location || "Kigali Rwanda"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">
                    {parseFloat(ev.ticket_price || 0).toLocaleString()} FRW
                  </span>
                  <Link
                    to={`/events/${ev.id}`}
                    target="_blank"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (4 cols): Site Public Statistics Widget */}
        <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-extrabold text-foreground text-base tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Site Public Counters
                </h3>
                <p className="text-xs text-muted-foreground">Live homepage achievement metrics</p>
              </div>

              {!editingStats ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingStats(true)}
                  className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingStats(false)}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    disabled={savingStats}
                    onClick={handleSaveStats}
                    className="h-7 px-2 text-xs bg-blue-600 text-white font-bold"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { key: "events_produced", label: "Events Produced", icon: Calendar },
                { key: "attendees_served", label: "Attendees Served", icon: Users },
                { key: "years_experience", label: "Years Experience", icon: Clock },
                { key: "countries_reached", label: "Countries Reached", icon: MapPin },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Icon className="w-3 h-3 text-secondary" />
                    <span>{label}</span>
                  </div>
                  {editingStats ? (
                    <Input
                      type="number"
                      value={statsForm[key] || 0}
                      onChange={(e) => setStatsForm({ ...statsForm, [key]: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs font-bold"
                    />
                  ) : (
                    <div className="text-xl font-black text-foreground tracking-tight">
                      {(siteStats[key] || 0).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direct link to contacts */}
          <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">New Client Inquiries:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab?.("contacts")}
              className="h-7 text-xs font-bold text-blue-600 hover:underline gap-1 p-0"
            >
              <span>{contacts.length} received</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 4. Template-Style Platform Transactions & Bookings Table ── */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Table Header Bar matching Template */}
        <div className="p-5 md:p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Recent Activity & Bookings
            </h3>
            <p className="text-xs text-muted-foreground">
              Live reservations and ticket passes across client orders
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Table Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search client or item..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl bg-muted/30 border-border/60"
              />
            </div>

            {/* Filter Pill */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl bg-muted/40 border border-border/60 text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table Content (Matching Template Design) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                <th className="py-3.5 px-6">Client / Contact</th>
                <th className="py-3.5 px-4">Booking Type</th>
                <th className="py-3.5 px-4">Item / Production</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No recent booking records matching your filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.slice(0, 8).map((b) => {
                  const clientName = b.profiles?.full_name || b.customer_name || "Private Client";
                  const clientEmail = b.profiles?.email || b.customer_email || "direct-booking@kundwa.rw";
                  const initials = clientName.slice(0, 2).toUpperCase();
                  const itemTitle = b.booking_type === "event"
                    ? b.events?.title || "Concert / Festival Pass"
                    : b.equipment?.name || "Production Rig";

                  const isApproved = b.status === "Approved" || b.status === "Completed";
                  const isPending = b.status === "Pending";

                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground block truncate">{clientName}</span>
                            <span className="text-[11px] text-muted-foreground block truncate">{clientEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Booking Type */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-muted">
                          {b.booking_type || "Event"}
                        </span>
                      </td>

                      {/* Item */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground truncate max-w-[200px] block">
                          {itemTitle}
                        </span>
                      </td>

                      {/* Status matching Template green / amber / red pills */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isPending
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          }`}
                        >
                          {b.status || "Pending"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(b.created_at || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-foreground">
                        {parseFloat(b.amount || 0).toLocaleString()} FRW
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-6 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateTab?.("bookings")}
                          className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Personal Admin Passes & Tickets (Integrated from Dashboard) ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/60 gap-4">
          <div>
            <h3 className="font-extrabold text-foreground text-base tracking-tight flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" />
              My Digital Passes & Personal Reservations
            </h3>
            <p className="text-xs text-muted-foreground">
              Tickets and equipment reservations attached to your account
            </p>
          </div>

          {/* Profile Edit Trigger */}
          {!editingProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingProfile(true)}
              className="text-xs font-bold rounded-xl h-8 gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit My Profile</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProfile(false)}
                className="h-8 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="h-8 text-xs font-bold bg-blue-600 text-white rounded-xl"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save Profile
              </Button>
            </div>
          )}
        </div>

        {/* Profile Inline Editor if active */}
        {editingProfile && (
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Full Name</label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Enter full name"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Phone Number</label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+250 78..."
                className="h-9 text-xs"
              />
            </div>
          </div>
        )}

        {/* Passes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTickets.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-xl">
              No personal tickets assigned to this account yet.
            </div>
          ) : (
            myTickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3 flex flex-col justify-between hover:border-secondary transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25">
                      {t.ticket_type}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {t.ticket_code}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-foreground truncate">
                    {t.events?.title || "VIP Event Pass"}
                  </h4>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-secondary" />
                    <span>
                      {t.events?.date && new Date(t.events.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveQrTicket(t)}
                    className="flex-1 h-8 text-xs font-bold gap-1 rounded-lg"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Pass</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCalendarEvent(t.events || { title: t.events?.title, date: t.events?.date })}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    title="Add to Calendar"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
          <div className="w-full max-w-sm bg-background text-foreground rounded-2xl p-6 shadow-2xl border border-border space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-extrabold text-foreground text-base">Digital Pass Verification</h3>
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
                  {activeQrTicket.events?.title || "VIP Event Pass"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeQrTicket.events?.venue || activeQrTicket.events?.location || "Kigali, Rwanda"}
                </p>
              </div>

              {/* QR representation */}
              <div className="w-36 h-36 bg-white p-2.5 rounded-xl shadow-xs border border-gray-200 mx-auto flex items-center justify-center">
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
              className="w-full btn-gold font-bold py-5 rounded-xl gap-2 shadow-md"
            >
              <Printer className="h-4 w-4" /> Print / Save Ticket Pass
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
