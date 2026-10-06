import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  X, 
  Download, 
  FileText, 
  Search, 
  Ticket, 
  DollarSign, 
  Users, 
  Award, 
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  Phone
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

const empty = { 
  title: "", 
  description: "", 
  date: "", 
  end_date: "",
  door_time: "4:00 PM",
  status: "Active",
  location: "Kigali Rwanda", 
  venue: "UR Gikondo Campus",
  organizer: "ROTARY CLUB KIGALI VIRUNGA",
  category: "FESTIVAL",
  phone: "+250789808030",
  image_url: "", 
  is_featured: false, 
  ticket_price: 5000, 
  total_tickets: 500,
  tickets_sold: 0,
  ticket_tiers: [
    {
      id: "tier-1",
      name: "EARLY BIRD TICKET",
      price: 5000,
      capacity: 200,
      sold: 0,
      description: "Standard entry pass"
    },
    {
      id: "tier-2",
      name: "GATE TICKET",
      price: 20000,
      capacity: 300,
      sold: 0,
      description: "Regular festival entry"
    }
  ]
};

export function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: false });
      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error("Could not fetch events:", err);
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const save = async () => {
    if (!form.title || !form.date) {
      toast({ title: "Title and start date are required", variant: "destructive" });
      return;
    }

    const tiers = Array.isArray(form.ticket_tiers) ? form.ticket_tiers : [];
    const minPrice = tiers.length > 0
      ? Math.min(...tiers.map((t: any) => parseFloat(t.price) || 0))
      : (parseFloat(form.ticket_price) || 0);

    const sumCapacity = tiers.length > 0
      ? tiers.reduce((acc: number, t: any) => acc + (parseInt(t.capacity) || 0), 0)
      : (parseInt(form.total_tickets) || 100);
    
    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      door_time: form.door_time || "4:00 PM",
      status: form.status || "Active",
      location: form.location,
      venue: form.venue,
      organizer: form.organizer,
      category: form.category,
      phone: form.phone,
      image_url: form.image_url,
      is_featured: form.is_featured,
      ticket_price: minPrice,
      total_tickets: sumCapacity,
      tickets_sold: parseInt(form.tickets_sold) || 0,
      ticket_tiers: tiers,
    };

    try {
      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Event updated successfully!" });
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast({ title: "Event created successfully!" });
      }
      setForm(null);
      setEditId(null);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? Associated tickets will be deleted.")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Event deleted" });
      if (selectedEvent?.id === id) setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const fetchAttendees = async (event: any) => {
    setSelectedEvent(event);
    setLoadingAttendees(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", event.id);

      if (error) throw error;

      setAttendees(data || []);
    } catch (err: any) {
      console.warn("Could not load attendees from database:", err);
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const toggleCheckIn = async (ticket: any) => {
    const newStatus = ticket.status === "Checked In" ? "Active" : "Checked In";
    try {
      const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", ticket.id);
      if (error) {
        // Fallback local update
        console.warn("Status update fallback:", error);
      }
      setAttendees(prev => prev.map(a => a.id === ticket.id ? { ...a, status: newStatus } : a));
      toast({ title: `Ticket status set to ${newStatus}` });
    } catch (err: any) {
      toast({ title: "Status update failed", description: err.message, variant: "destructive" });
    }
  };

  // Ticket Tier management helpers
  const handleAddTier = () => {
    const newTier = {
      id: `tier-${Date.now()}`,
      name: "NEW TICKET TIER",
      price: 15000,
      capacity: 100,
      sold: 0,
      description: "General Access pass"
    };
    setForm({ ...form, ticket_tiers: [...(form.ticket_tiers || []), newTier] });
  };

  const handleUpdateTier = (index: number, field: string, value: any) => {
    const updated = [...(form.ticket_tiers || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, ticket_tiers: updated });
  };

  const handleRemoveTier = (index: number) => {
    const updated = (form.ticket_tiers || []).filter((_: any, i: number) => i !== index);
    setForm({ ...form, ticket_tiers: updated });
  };

  const handleExportEventsExcel = () => {
    const dataToExport = filteredEvents.map(e => ({
      ID: e.id,
      Title: e.title,
      Status: e.status || "Active",
      Date: new Date(e.date).toLocaleString(),
      "End Date": e.end_date ? new Date(e.end_date).toLocaleString() : "N/A",
      Location: e.location || "N/A",
      Venue: e.venue || "N/A",
      Organizer: e.organizer || "N/A",
      Category: e.category || "N/A",
      Phone: e.phone || "N/A",
      "Min Price (RWF)": e.ticket_price,
      "Tickets Sold": e.tickets_sold,
      "Total Capacity": e.total_tickets,
      "Featured?": e.is_featured ? "Yes" : "No"
    }));
    exportToExcel(dataToExport, "Events_Ticketing_Master_Report");
  };

  const handleExportEventsPDF = () => {
    const columns = [
      { header: "Event Title", key: "title" },
      { header: "Date", key: "date", format: (v: string) => new Date(v).toLocaleDateString() },
      { header: "Venue", key: "venue" },
      { header: "Status", key: "status" },
      { header: "Sold / Total", key: "tickets_sold", format: (v: any, row?: any) => `${v} / ${row?.total_tickets || 100}` },
      { header: "From Price", key: "ticket_price", format: (v: any) => `${v} RWF` },
    ];
    exportToPDF("Events Capacity & Ticketing Manifest", columns, filteredEvents);
  };

  const handleExportAttendeesExcel = () => {
    if (!selectedEvent) return;
    const dataToExport = attendees.map(a => ({
      "Ticket Code": a.ticket_code,
      Attendee: a.customer_name || a.profiles?.full_name || "N/A",
      Email: a.customer_email || a.profiles?.email || "N/A",
      Phone: a.customer_phone || a.profiles?.phone || "N/A",
      Tier: a.ticket_type,
      Quantity: a.quantity || 1,
      Status: a.status,
      "Purchased At": new Date(a.purchased_at).toLocaleString()
    }));
    exportToExcel(dataToExport, `Attendees_${selectedEvent.title.replace(/\s+/g, "_")}`);
  };

  const handleExportAttendeesPDF = () => {
    if (!selectedEvent) return;
    const columns = [
      { header: "Ticket Code", key: "ticket_code" },
      { header: "Attendee", key: "customer_name" },
      { header: "Phone", key: "customer_phone" },
      { header: "Tier", key: "ticket_type" },
      { header: "Qty", key: "quantity" },
      { header: "Status", key: "status" }
    ];
    const mapped = attendees.map(a => ({
      ...a,
      customer_name: a.customer_name || a.profiles?.full_name || "N/A",
      customer_phone: a.customer_phone || a.profiles?.phone || "N/A",
      quantity: a.quantity || 1
    }));
    exportToPDF(`Attendee Manifest - ${selectedEvent.title}`, columns, mapped);
  };

  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.venue?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview Analytics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Calendar className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Events</p>
            <p className="text-xl font-bold text-foreground">{events.length}</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Ticket className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Tickets Sold</p>
            <p className="text-xl font-bold text-foreground">{events.reduce((acc, e) => acc + (e.tickets_sold || 0), 0)}</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><DollarSign className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Est. Gross Sales</p>
            <p className="text-xl font-bold text-foreground">{events.reduce((acc, e) => acc + ((e.tickets_sold || 0) * (e.ticket_price || 0)), 0).toLocaleString()} RWF</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Award className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Featured Shows</p>
            <p className="text-xl font-bold text-foreground">{events.filter(e => e.is_featured).length}</p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-border/20 pt-4">
        <h2 className="font-bold text-foreground text-lg">Events & Ticketing Control ({filteredEvents.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportEventsExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportEventsPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button 
            className="btn-gold gap-1.5 flex-1 sm:flex-initial" 
            onClick={() => { 
              setForm({ ...empty }); 
              setEditId(null); 
            }}
          >
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search events by title, venue, or location..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9"
        />
      </div>

      {/* Comprehensive Add / Edit Event & Ticket Form Modal */}
      {form && (
        <div className="card-premium p-6 space-y-6 border-2 border-primary/30 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-foreground text-lg">{editId ? "Edit Event & Tickets" : "New Event Creation"}</h3>
              <p className="text-xs text-muted-foreground">Configure public event details, dates, venue, contact, and ticket tiers.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground font-semibold">Event Title *</label>
              <Input 
                placeholder="e.g. RYLA Rwanda" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Category</label>
              <Input 
                placeholder="e.g. FESTIVAL, CONCERT, SUMMIT" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
              />
            </div>

            {/* Start Date & Time */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Start Date & Time *</label>
              <Input 
                type="datetime-local" 
                value={form.date?.slice(0, 16)} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
              />
            </div>

            {/* End Date & Time */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">End Date & Time</label>
              <Input 
                type="datetime-local" 
                value={form.end_date?.slice(0, 16) || ""} 
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} 
              />
            </div>

            {/* Door Time */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Door Opening Time</label>
              <Input 
                placeholder="e.g. 4:00 PM" 
                value={form.door_time} 
                onChange={(e) => setForm({ ...form, door_time: e.target.value })} 
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Event Status</label>
              <select
                value={form.status || "Active"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Active">Active (On Sale)</option>
                <option value="Upcoming">Upcoming (Coming Soon)</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Expired">Expired</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Location (City / Country)</label>
              <Input 
                placeholder="e.g. Kigali Rwanda" 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
              />
            </div>

            {/* Venue */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Specific Venue</label>
              <Input 
                placeholder="e.g. UR Gikondo Campus" 
                value={form.venue} 
                onChange={(e) => setForm({ ...form, venue: e.target.value })} 
              />
            </div>

            {/* Organizer */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Organizer</label>
              <Input 
                placeholder="e.g. ROTARY CLUB KIGALI VIRUNGA" 
                value={form.organizer} 
                onChange={(e) => setForm({ ...form, organizer: e.target.value })} 
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Contact / Inquiry Phone</label>
              <Input 
                placeholder="e.g. +250789808030" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              />
            </div>

            {/* Poster Image */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground font-semibold">Flyer / Poster Image URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="/ryla-rwanda.jpg or https://..." 
                  value={form.image_url} 
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                  className="flex-1" 
                />
                <FileUpload onUpload={(url) => setForm({ ...form, image_url: url })} label="Upload Flyer" />
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-2 pt-2 sm:col-span-3">
              <input 
                type="checkbox" 
                id="featured" 
                checked={form.is_featured} 
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} 
                className="h-4 w-4 rounded border-border text-primary"
              />
              <label htmlFor="featured" className="text-sm text-foreground font-semibold cursor-pointer">
                Feature on Homepage banner & spotlight displays
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Event Description</label>
            <Textarea 
              placeholder="Theme, workshop topics, guest artists, parking guidelines..." 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          {/* Ticket Tiers & Pricing Manager */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" /> Ticket Tiers & Quantities
                </h4>
                <p className="text-xs text-muted-foreground">
                  Define various ticket tiers (e.g. Early Bird, VIP, Table) that users can choose and purchase.
                </p>
              </div>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={handleAddTier}
                className="text-xs font-bold gap-1 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" /> Add Ticket Tier
              </Button>
            </div>

            <div className="space-y-3">
              {(form.ticket_tiers || []).map((tier: any, index: number) => (
                <div key={tier.id || index} className="p-3.5 rounded-xl border border-border bg-muted/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* Tier Name */}
                  <div className="sm:col-span-4">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Tier Name</label>
                    <Input 
                      placeholder="EARLY BIRD TICKET" 
                      value={tier.name} 
                      onChange={(e) => handleUpdateTier(index, "name", e.target.value)} 
                      className="h-8 text-xs font-bold"
                    />
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Price (RWF)</label>
                    <Input 
                      type="number"
                      placeholder="5000" 
                      value={tier.price} 
                      onChange={(e) => handleUpdateTier(index, "price", parseFloat(e.target.value) || 0)} 
                      className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Capacity</label>
                    <Input 
                      type="number"
                      placeholder="100" 
                      value={tier.capacity} 
                      onChange={(e) => handleUpdateTier(index, "capacity", parseInt(e.target.value) || 0)} 
                      className="h-8 text-xs font-semibold"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Perks/Notes</label>
                    <Input 
                      placeholder="Access pass" 
                      value={tier.description || ""} 
                      onChange={(e) => handleUpdateTier(index, "description", e.target.value)} 
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Delete Action */}
                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTier(index)}
                      title="Remove Tier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(form.ticket_tiers || []).length === 0 && (
                <div className="p-4 border-2 border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
                  No ticket tiers added. Click "+ Add Ticket Tier" above.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button className="btn-gold font-bold px-6" onClick={save}>Save Event & Tiers</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Main View Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Events List / Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredEvents.map(e => {
              const totalCap = e.total_tickets || 100;
              const sold = e.tickets_sold || 0;
              const pct = Math.min(100, Math.round((sold / totalCap) * 100));
              const revenue = sold * (parseFloat(e.ticket_price) || 0);

              const tiersCount = (e.ticket_tiers && Array.isArray(e.ticket_tiers)) ? e.ticket_tiers.length : 0;

              return (
                <div 
                  key={e.id} 
                  onClick={() => fetchAttendees(e)}
                  className={`card-premium p-5 flex flex-col justify-between cursor-pointer border-t-4 transition-all ${
                    selectedEvent?.id === e.id ? "border-t-secondary scale-[1.01] shadow-lg ring-1 ring-secondary/30" : "border-t-primary hover:border-t-secondary"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-foreground text-base leading-tight truncate max-w-[170px]">
                            {e.title}
                          </h4>
                          {e.is_featured && <Star className="h-3.5 w-3.5 text-secondary fill-secondary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(e.date).toLocaleDateString()} • {e.venue || e.location}
                        </p>
                      </div>

                      <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => { 
                            setForm({
                              ...e,
                              ticket_tiers: Array.isArray(e.ticket_tiers) ? e.ticket_tiers : []
                            }); 
                            setEditId(e.id); 
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive" 
                          onClick={() => remove(e.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {e.category || "Festival"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (e.status || "Active").toLowerCase() === "active" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {e.status || "Active"}
                      </span>
                      {tiersCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                          {tiersCount} Tier{tiersCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/60">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Capacity Sold ({pct}%)</span>
                      <span className="text-foreground">{sold} / {totalCap}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-muted-foreground">From: {(parseFloat(e.ticket_price) || 0).toLocaleString()} RWF</span>
                      <span className="font-bold text-secondary">Rev: {revenue.toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredEvents.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-10 col-span-2">No events match your search query.</p>
            )}
          </div>
        </div>

        {/* Selected Event Attendee Manifest */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="card-premium p-6 space-y-4 animate-scale-in">
              <div className="flex justify-between items-start border-b border-border/60 pb-3">
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">Attendee List</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[190px]">{selectedEvent.title}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExportAttendeesExcel} title="Export Excel">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExportAttendeesPDF} title="Export PDF">
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEvent(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingAttendees ? (
                <p className="text-muted-foreground text-xs text-center py-6">Loading attendees...</p>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 divide-y divide-border/40">
                  {attendees.map(a => {
                    const isCheckedIn = a.status === "Checked In";
                    const attendeeName = a.customer_name || a.profiles?.full_name || "Guest Attendee";
                    const attendeeEmail = a.customer_email || a.profiles?.email || "";
                    const attendeePhone = a.customer_phone || a.profiles?.phone || "";

                    return (
                      <div key={a.id} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-xs truncate">{attendeeName}</p>
                            {attendeeEmail && <p className="text-[10px] text-muted-foreground truncate">{attendeeEmail}</p>}
                            {attendeePhone && <p className="text-[10px] text-muted-foreground font-mono">{attendeePhone}</p>}
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-secondary/15 text-secondary block mb-1">
                              {a.ticket_type}
                            </span>
                            <button
                              onClick={() => toggleCheckIn(a)}
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                isCheckedIn 
                                  ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/40" 
                                  : "bg-muted text-muted-foreground hover:text-foreground border-border"
                              }`}
                              title="Click to toggle Check-In"
                            >
                              {isCheckedIn ? "✓ Checked In" : "Mark Present"}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground/80">
                          <span>{a.ticket_code}</span>
                          <span>Qty: {a.quantity || 1}</span>
                        </div>
                      </div>
                    );
                  })}
                  {attendees.length === 0 && (
                    <p className="text-muted-foreground text-xs text-center py-6">No attendees registered yet for this event.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-premium p-8 text-center text-muted-foreground text-xs border-dashed space-y-2">
              <Ticket className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="font-semibold text-foreground">Live Attendee Manifest</p>
              <p>Click any event on the left to inspect registered attendees, check them in at the door, and download attendee reports.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEvents;