import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.client_name || !form.message) { toast({ title: "Name and message required", variant: "destructive" }); return; }
    const payload = { client_name: form.client_name, message: form.message, image_url: form.image_url };
    if (editId) await supabase.from("testimonials").update(payload).eq("id", editId);
    else await supabase.from("testimonials").insert(payload);
    toast({ title: "Saved!" }); setForm(null); setEditId(null); load();
  };

  const remove = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Deleted" }); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-lg">Testimonials ({items.length})</h2>
        <Button className="btn-gold gap-1" onClick={() => { setForm({ client_name: "", message: "", image_url: "" }); setEditId(null); }}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {form && (
        <div className="card-premium p-6 space-y-3">
          <div className="flex justify-between"><h3 className="font-semibold">{editId ? "Edit" : "New"} Testimonial</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Client Name" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          <Textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Button className="btn-gold" onClick={save}>Save</Button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="card-premium p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{t.client_name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-md">{t.message}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm(t); setEditId(t.id); }}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}