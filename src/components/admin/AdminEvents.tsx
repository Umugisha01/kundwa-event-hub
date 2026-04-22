import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Star, X } from "lucide-react";

const empty = { title: "", description: "", date: "", location: "", image_url: "", is_featured: false, ticket_price: 0, total_tickets: 100 };

export function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("events").select("*").order("date", { ascending: false });
    setEvents(data || []);
  };
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.title || !form.date) { toast({ title: "Title and date are required", variant: "destructive" }); return; }
    if (editId) {
      const { error } = await supabase.from("events").update(form).eq("id", editId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("events").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editId ? "Event updated!" : "Event created!" });
    setForm(null); setEditId(null); fetch();
  };

  const remove = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Event deleted" }); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-lg">Events ({events.length})</h2>
        <Button className="btn-gold gap-1" onClick={() => { setForm({ ...empty }); setEditId(null); }}>
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {form && (
        <div className="card-premium p-6 space-y-3">
          <div className="flex justify-between"><h3 className="font-semibold">{editId ? "Edit Event" : "New Event"}</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input type="datetime-local" value={form.date?.slice(0, 16)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Input type="number" placeholder="Ticket Price" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: parseFloat(e.target.value) || 0 })} />
            <Input type="number" placeholder="Total Tickets" value={form.total_tickets} onChange={(e) => setForm({ ...form, total_tickets: parseInt(e.target.value) || 0 })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
            Featured Event
          </label>
          <Button className="btn-gold" onClick={save}>Save</Button>
        </div>
      )}

      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="card-premium p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{e.title}</p>
                {e.is_featured && <Star className="h-4 w-4 text-secondary fill-secondary" />}
              </div>
              <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()} — {e.location}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm(e); setEditId(e.id); }}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(e.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}