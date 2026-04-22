import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export function AdminServices() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("services").select("*").order("created_at");
    setItems(data || []);
  };
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    const payload = { name: form.name, description: form.description, icon: form.icon, image_url: form.image_url };
    if (editId) {
      await supabase.from("services").update(payload).eq("id", editId);
    } else {
      await supabase.from("services").insert(payload);
    }
    toast({ title: editId ? "Service updated!" : "Service created!" });
    setForm(null); setEditId(null); fetch();
  };

  const remove = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    toast({ title: "Service deleted" }); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-lg">Services ({items.length})</h2>
        <Button className="btn-gold gap-1" onClick={() => { setForm({ name: "", description: "", icon: "", image_url: "" }); setEditId(null); }}>
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>
      {form && (
        <div className="card-premium p-6 space-y-3">
          <div className="flex justify-between"><h3 className="font-semibold">{editId ? "Edit" : "New"} Service</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input placeholder="Icon name (e.g. Speaker)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Button className="btn-gold" onClick={save}>Save</Button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="card-premium p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-md">{s.description}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setForm(s); setEditId(s.id); }}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}