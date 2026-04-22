import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, X } from "lucide-react";

export function AdminBrands() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("trusted_brands").select("*").order("created_at");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) { toast({ title: "Name required", variant: "destructive" }); return; }
    await supabase.from("trusted_brands").insert({ name: form.name, logo_url: form.logo_url });
    toast({ title: "Brand added!" }); setForm(null); load();
  };

  const remove = async (id: string) => {
    await supabase.from("trusted_brands").delete().eq("id", id);
    toast({ title: "Removed" }); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-lg">Trusted Brands ({items.length})</h2>
        <Button className="btn-gold gap-1" onClick={() => setForm({ name: "", logo_url: "" })}>
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>
      {form && (
        <div className="card-premium p-6 space-y-3">
          <div className="flex justify-between"><h3 className="font-semibold">Add Brand</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Brand Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          <Button className="btn-gold" onClick={save}>Save</Button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((b) => (
          <div key={b.id} className="card-premium p-4 text-center relative group">
            {b.logo_url && <img src={b.logo_url} alt={b.name} className="h-12 mx-auto mb-2 object-contain" />}
            <p className="text-sm font-medium text-foreground">{b.name}</p>
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(b.id)}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}