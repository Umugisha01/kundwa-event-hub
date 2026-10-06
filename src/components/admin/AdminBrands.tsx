import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Download, FileText, Search, Image } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

export function AdminBrands() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const { data, error } = await supabase.from("trusted_brands").select("*").order("name");
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.name) {
      toast({ title: "Brand Name required", variant: "destructive" });
      return;
    }
    const payload = { name: form.name, logo_url: form.logo_url };

    try {
      if (editId) {
        const { error } = await supabase.from("trusted_brands").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Brand updated!" });
      } else {
        const { error } = await supabase.from("trusted_brands").insert(payload);
        if (error) throw error;
        toast({ title: "Brand added!" });
      }
      setForm(null);
      setEditId(null);
      load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this brand logo?")) return;
    try {
      const { error } = await supabase.from("trusted_brands").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Brand removed" });
      load();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredItems = items.filter(b => 
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const exportData = filteredItems.map(b => ({
      ID: b.id,
      "Brand Name": b.name,
      "Logo URL": b.logo_url || "N/A"
    }));
    exportToExcel(exportData, "Trusted_Brands_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Brand Name", key: "name" },
      { header: "Brand Logo Link", key: "logo_url" }
    ];
    exportToPDF("Trusted Partnership Brands Manifest", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Trusted Partners ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ name: "", logo_url: "" }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Partner
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search brands..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9"
        />
      </div>

      {/* Form Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Partner Brand</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Brand Name *</label>
              <Input placeholder="MTN Rwanda" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Brand Logo URL (optional)</label>
              <div className="flex gap-2">
                <Input placeholder="https://logos.com/..." value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, logo_url: url })} label="Choose File" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Brand</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Brands Grid View */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {filteredItems.map((b) => (
          <div key={b.id} className="card-premium p-4 text-center relative group flex flex-col justify-between items-center h-32">
            <div className="flex-1 flex items-center justify-center">
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.name} className="h-10 max-w-full object-contain" />
              ) : (
                <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded flex items-center justify-center text-primary">
                  <Image className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-foreground mt-2 truncate max-w-full">{b.name}</p>
            
            {/* Action overlay */}
            <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background/80 rounded border border-border/40 p-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setForm(b); setEditId(b.id); }}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(b.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-4 text-center py-8">No partner brands found.</p>
        )}
      </div>
    </div>
  );
}