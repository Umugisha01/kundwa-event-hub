import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const categories = ["Audio", "Lighting", "Stage", "Visual", "Other"];

export function AdminEquipment() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("equipment").select("*").order("created_at");
    setItems(data || []);
  };
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.name) { toast({ title: "Name required", variant: "destructive" }); return; }
    const payload = { name: form.name, category: form.category, description: form.description, image_url: form.image_url, status: form.status };
    if (editId) await supabase.from("equipment").update(payload).eq("id", editId);
    else await supabase.from("equipment").insert(payload);
    toast({ title: editId ? "Updated!" : "Created!" });
    setForm(null); setEditId(null); fetch();
  };

  const remove = async (id: string) => {
    await supabase.from("equipment").delete().eq("id", id);
    toast({ title: "Deleted" }); fetch();
  };

  const toggle = async (id: string, current: string) => {
    const next = current === "Available" ? "Booked" : "Available";
    await supabase.from("equipment").update({ status: next }).eq("id", id);
    fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-lg">Equipment ({items.length})</h2>
        <Button className="btn-gold gap-1" onClick={() => { setForm({ name: "", category: "Audio", description: "", image_url: "", status: "Available" }); setEditId(null); }}>
          <Plus className="h-4 w-4" /> Add Equipment
        </Button>
      </div>
      {form && (
        <div className="card-premium p-6 space-y-3">
          <div className="flex justify-between"><h3 className="font-semibold">{editId ? "Edit" : "New"} Equipment</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Button className="btn-gold" onClick={save}>Save</Button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((eq) => (
          <div key={eq.id} className="card-premium p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{eq.name}</p>
              <p className="text-xs text-muted-foreground">{eq.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={eq.status === "Available" ? "secondary" : "outline"} size="sm" onClick={() => toggle(eq.id, eq.status)}>
                {eq.status}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setForm(eq); setEditId(eq.id); }}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(eq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}