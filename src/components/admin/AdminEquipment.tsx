import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Download, FileText, Search, ShieldCheck, ShieldAlert } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";

const categories = ["Audio", "Lighting", "Stage", "Visual", "Other"];

export function AdminEquipment() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("equipment").select("*").order("created_at");
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const save = async () => {
    if (!form.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const payload = { 
      name: form.name, 
      category: form.category, 
      description: form.description, 
      image_url: form.image_url, 
      status: form.status 
    };

    try {
      if (editId) {
        const { error } = await supabase.from("equipment").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Rentals updated!" });
      } else {
        const { error } = await supabase.from("equipment").insert(payload);
        if (error) throw error;
        toast({ title: "Rentals created!" });
      }
      setForm(null);
      setEditId(null);
      fetchItems();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rental item?")) return;
    try {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Rental item deleted" });
      fetchItems();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const toggle = async (id: string, current: string) => {
    const next = current === "Available" ? "Booked" : "Available";
    try {
      const { error } = await supabase.from("equipment").update({ status: next }).eq("id", id);
      if (error) throw error;
      toast({ title: `Status marked as ${next}` });
      fetchItems();
    } catch (err: any) {
      toast({ title: "Status toggle failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredItems = items.filter(eq => {
    const matchesSearch = eq.name?.toLowerCase().includes(search.toLowerCase()) || 
                          eq.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || eq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportExcel = () => {
    const exportData = filteredItems.map(eq => ({
      ID: eq.id,
      Name: eq.name,
      Category: eq.category,
      Status: eq.status,
      "Image URL": eq.image_url || "N/A",
      Description: eq.description
    }));
    exportToExcel(exportData, "Equipment_Rentals_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Equipment Name", key: "name" },
      { header: "Category", key: "category" },
      { header: "Status", key: "status" },
      { header: "Description", key: "description" }
    ];
    exportToPDF("Equipment Rentals Catalog", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Equipment Rentals ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ name: "", category: "Audio", description: "", image_url: "", status: "Available" }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search equipment by name, details..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)} 
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Form Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Rental Item</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Equipment Name *</label>
              <Input placeholder="Dual 18' Stage Subwoofers" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Category</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Availability Status</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="Booked">Booked/Unavailable</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Image URL</label>
              <Input placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Technical Specifications / Description</label>
            <Textarea placeholder="Power outputs, dimensions, category, channel info..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Item</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Equipment Rental Table */}
      <div className="border border-border/40 rounded-xl overflow-hidden bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-3 font-semibold text-muted-foreground">Item details</th>
                <th className="p-3 font-semibold text-muted-foreground">Category</th>
                <th className="p-3 font-semibold text-muted-foreground">Status</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(eq => (
                <tr key={eq.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{eq.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 truncate max-w-sm">{eq.description || "No description."}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-muted rounded">{eq.category}</span>
                  </td>
                  <td className="p-3">
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => toggle(eq.id, eq.status)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold hover:scale-105 transition-all ${
                        eq.status === "Available" 
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      }`}
                    >
                      {eq.status === "Available" ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                      {eq.status}
                    </Button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm(eq); setEditId(eq.id); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(eq.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                    No rental equipment found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}