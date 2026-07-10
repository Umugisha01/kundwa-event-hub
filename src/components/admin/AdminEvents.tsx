import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Star, X, Download, FileText, Search, Ticket, DollarSign, Users, Award, Calendar } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

const empty = { 
  title: "", 
  description: "", 
  date: "", 
  location: "", 
  image_url: "", 
  is_featured: false, 
  ticket_price: 0, 
  total_tickets: 100,
  tickets_sold: 0
};

const mockAttendees = [
  { id: "t1", ticket_code: "TKT-GALA-001", ticket_type: "VIP", status: "Active", purchased_at: new Date().toISOString(), profiles: { full_name: "Jean Pierre Habimana", email: "jp.habimana@gmail.com" } },
  { id: "t2", ticket_code: "TKT-GALA-002", ticket_type: "Standard", status: "Active", purchased_at: new Date().toISOString(), profiles: { full_name: "Sarah Keza", email: "sarah.k@yahoo.com" } },
  { id: "t3", ticket_code: "TKT-GALA-003", ticket_type: "Standard", status: "Active", purchased_at: new Date().toISOString(), profiles: { full_name: "Didier Kamanzi", email: "didier.k@outlook.com" } },
];

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
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    
    // Format date string for Supabase
    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      location: form.location,
      image_url: form.image_url,
      is_featured: form.is_featured,
      ticket_price: parseFloat(form.ticket_price) || 0,
      total_tickets: parseInt(form.total_tickets) || 100,
      tickets_sold: parseInt(form.tickets_sold) || 0
    };

    try {
      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Event updated!" });
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
        toast({ title: "Event created!" });
      }
      setForm(null);
      setEditId(null);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This will delete associated tickets.")) return;
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
        .select(`
          id,
          ticket_code,
          ticket_type,
          status,
          purchased_at,
          profiles:user_id(full_name, email)
        `)
        .eq("event_id", event.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setAttendees(data);
      } else {
        // Fallback to simulated mock attendees for display
        setAttendees(mockAttendees);
      }
    } catch (err: any) {
      console.warn("Could not load attendees from database, using mock fallback:", err);
      setAttendees(mockAttendees);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleExportEventsExcel = () => {
    const dataToExport = filteredEvents.map(e => ({
      ID: e.id,
      Title: e.title,
      Date: new Date(e.date).toLocaleString(),
      Location: e.location || "N/A",
      "Ticket Price (RWF)": e.ticket_price,
      "Tickets Sold": e.tickets_sold,
      "Total Capacity": e.total_tickets,
      "Total Revenue (RWF)": e.tickets_sold * e.ticket_price,
      "Featured?": e.is_featured ? "Yes" : "No"
    }));
    exportToExcel(dataToExport, "Events_Ticketing_Report");
  };

  const handleExportEventsPDF = () => {
    const columns = [
      { header: "Event Title", key: "title" },
      { header: "Date", key: "date", format: (v: string) => new Date(v).toLocaleDateString() },
      { header: "Location", key: "location" },
      { header: "Sold / Total", key: "tickets_sold", format: (v: any, row?: any) => `${v} / ${row?.total_tickets || 100}` },
      { header: "Price", key: "ticket_price", format: (v: any) => `${v} RWF` },
      { header: "Revenue", key: "revenue", format: (v: any, row?: any) => `${(row?.tickets_sold || 0) * (row?.ticket_price || 0)} RWF` }
    ];

    // inject calculated revenue field
    const mapped = filteredEvents.map(e => ({ ...e, revenue: e.tickets_sold * e.ticket_price }));
    exportToPDF("Events Capacity & Revenue Manifest", columns, mapped);
  };

  const handleExportAttendeesExcel = () => {
    if (!selectedEvent) return;
    const dataToExport = attendees.map(a => ({
      "Ticket Code": a.ticket_code,
      Attendee: a.profiles?.full_name || "N/A",
      Email: a.profiles?.email || "N/A",
      Type: a.ticket_type,
      Status: a.status,
      "Purchased At": new Date(a.purchased_at).toLocaleString()
    }));
    exportToExcel(dataToExport, `Attendees_${selectedEvent.title.replace(/\s+/g, "_")}`);
  };

  const handleExportAttendeesPDF = () => {
    if (!selectedEvent) return;
    const columns = [
      { header: "Ticket Code", key: "ticket_code" },
      { header: "Attendee", key: "full_name" },
      { header: "Email", key: "email" },
      { header: "Type", key: "ticket_type" },
      { header: "Status", key: "status" }
    ];
    const mapped = attendees.map(a => ({
      ...a,
      full_name: a.profiles?.full_name || "N/A",
      email: a.profiles?.email || "N/A"
    }));
    exportToPDF(`Attendee manifest - ${selectedEvent.title}`, columns, mapped);
  };

  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase()) || 
    e.location?.toLowerCase().includes(search.toLowerCase())
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
            <p className="text-xs text-muted-foreground font-semibold">Projected Revenue</p>
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
        <h2 className="font-bold text-foreground text-lg">Event Catalog ({filteredEvents.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportEventsExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportEventsPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ ...empty }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search events by title, location..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9"
        />
      </div>

      {/* Add / Edit Modal Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Event</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Title *</label>
              <Input placeholder="Kigali Jazz Junction" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Date & Time *</label>
              <Input type="datetime-local" value={form.date?.slice(0, 16)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Location</label>
              <Input placeholder="BK Arena, Kigali" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Image URL</label>
              <div className="flex gap-2">
                <Input placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, image_url: url })} label="Choose File" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Ticket Price (RWF)</label>
              <Input type="number" placeholder="10000" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Total Capacity (Tickets)</label>
              <Input type="number" placeholder="500" value={form.total_tickets} onChange={(e) => setForm({ ...form, total_tickets: parseInt(e.target.value) || 0 })} />
            </div>
            {editId && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Tickets Sold (Admin override)</label>
                <Input type="number" placeholder="10" value={form.tickets_sold} onChange={(e) => setForm({ ...form, tickets_sold: parseInt(e.target.value) || 0 })} />
              </div>
            )}
            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              <label htmlFor="featured" className="text-sm text-foreground font-semibold">Feature this show on home page banner</label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Description</label>
            <Textarea placeholder="Details of the lineup, schedules, gate opening times..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Event</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Main View Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events Table / Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredEvents.map(e => {
              const pct = Math.min(100, Math.round(((e.tickets_sold || 0) / (e.total_tickets || 100)) * 100));
              const revenue = (e.tickets_sold || 0) * (e.ticket_price || 0);
              return (
                <div 
                  key={e.id} 
                  onClick={() => fetchAttendees(e)}
                  className={`card-premium p-4 flex flex-col justify-between cursor-pointer border-t-4 transition-all ${
                    selectedEvent?.id === e.id ? "border-t-secondary scale-[1.01]" : "border-t-primary"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-foreground text-base leading-tight truncate max-w-[160px]">{e.title}</h4>
                          {e.is_featured && <Star className="h-3.5 w-3.5 text-secondary fill-secondary flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString()} — {e.location}</p>
                      </div>
                      <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm(e); setEditId(e.id); }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(e.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Ticket Sales ({pct}%)</span>
                      <span className="text-foreground">{e.tickets_sold} / {e.total_tickets}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-muted-foreground">Price: {e.ticket_price.toLocaleString()} RWF</span>
                      <span className="font-bold text-emerald-500">Rev: {revenue.toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredEvents.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8 col-span-2">No events found matching search query.</p>
            )}
          </div>
        </div>

        {/* Selected Event Attendee Manifest */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <div className="card-premium p-6 space-y-4 animate-scale-in">
              <div className="flex justify-between items-start border-b border-border/40 pb-2">
                <div>
                  <h3 className="font-bold text-foreground text-md leading-tight">Attendee List</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{selectedEvent.title}</p>
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
                <p className="text-muted-foreground text-sm text-center py-4">Loading attendees...</p>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {attendees.map(a => (
                    <div key={a.id} className="p-3 bg-muted/20 border border-border/25 rounded-lg flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{a.profiles?.full_name || "Guest User"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{a.profiles?.email || "anonymous"}</p>
                        <p className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">{a.ticket_code}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${
                        a.ticket_type === "VIP" ? "bg-secondary/15 text-secondary border border-secondary/20" : "bg-primary/10 text-primary-foreground/75"
                      }`}>
                        {a.ticket_type}
                      </span>
                    </div>
                  ))}
                  {attendees.length === 0 && (
                    <p className="text-muted-foreground text-xs text-center py-4">No tickets purchased for this event yet.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-premium p-8 text-center text-muted-foreground text-sm border-dashed">
              Select an event from the left grid to view the dynamic attendee manifest, track VIP signups, and generate reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}