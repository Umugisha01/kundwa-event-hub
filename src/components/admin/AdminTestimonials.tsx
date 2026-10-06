import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Download, FileText, Search, Quote } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

export function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
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
    if (!form.client_name || !form.message) {
      toast({ title: "Name and message required", variant: "destructive" });
      return;
    }
    const payload = { 
      client_name: form.client_name, 
      message: form.message, 
      image_url: form.image_url 
    };

    try {
      if (editId) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Testimonial updated!" });
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
        toast({ title: "Testimonial created!" });
      }
      setForm(null);
      setEditId(null);
      load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      load();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredItems = items.filter(t => 
    t.client_name?.toLowerCase().includes(search.toLowerCase()) || 
    t.message?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const exportData = filteredItems.map(t => ({
      ID: t.id,
      "Client Name": t.client_name,
      Message: t.message,
      "Avatar URL": t.image_url || "N/A"
    }));
    exportToExcel(exportData, "Testimonials_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Client Name", key: "client_name" },
      { header: "Feedback Message", key: "message" }
    ];
    exportToPDF("What Clients Say — Testimonials Report", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Client Testimonials ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ client_name: "", message: "", image_url: "" }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Feedback
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search testimonials..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9"
        />
      </div>

      {/* Form Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Testimonial</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Client Name *</label>
              <Input placeholder="Hon. Jane Doe" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Avatar Image URL (optional)</label>
              <div className="flex gap-2">
                <Input placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, image_url: url })} label="Choose File" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Testimonial Quote / Message *</label>
            <Textarea placeholder="Kundwa IB Group exceeded all our event production expectations..." rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Testimonial</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Testimonials Table view - Desktop */}
      <div className="hidden md:block border border-border/40 rounded-xl overflow-hidden bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-3 font-semibold text-muted-foreground w-16">Avatar</th>
                <th className="p-3 font-semibold text-muted-foreground w-44">Client</th>
                <th className="p-3 font-semibold text-muted-foreground">Feedback Quote</th>
                <th className="p-3 font-semibold text-muted-foreground text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(t => (
                <tr key={t.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="p-3">
                    {t.image_url ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
                        <img src={t.image_url} alt={t.client_name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Quote className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    {t.client_name}
                  </td>
                  <td className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">"{t.message}"</p>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm(t); setEditId(t.id); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                    No testimonials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials Card view - Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredItems.map(t => (
          <div key={t.id} className="card-premium p-4 space-y-3">
            <div className="flex items-center gap-3">
              {t.image_url ? (
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                  <img src={t.image_url} alt={t.client_name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Quote className="h-4 w-4" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-foreground text-sm">{t.client_name}</h4>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic bg-muted/10 p-2.5 rounded-lg border border-border/30">
              "{t.message}"
            </p>
            <div className="flex justify-end gap-1.5 pt-2 border-t border-border/40">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm(t); setEditId(t.id); }}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No testimonials found.</p>
        )}
      </div>
    </div>
  );
}