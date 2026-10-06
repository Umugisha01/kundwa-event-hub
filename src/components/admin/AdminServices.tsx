import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Download, FileText, Search, Settings } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

const empty = { 
  name: "", 
  description: "", 
  icon: "", 
  image_url: "",
  category: "Event Production",
  tagline: "",
  featuresText: "",
  galleryText: "",
  highlightsText: "[]",
  faqsText: "[]"
};

export function AdminServices() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("services").select("*").order("name");
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
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    // Split newline text lists into arrays
    const featuresList = form.featuresText 
      ? form.featuresText.split("\n").map((f: string) => f.trim()).filter(Boolean) 
      : [];
    const galleryList = form.galleryText 
      ? form.galleryText.split("\n").map((img: string) => img.trim()).filter(Boolean) 
      : [];
    
    // Parse highlights JSON
    let highlightsList = [];
    try {
      highlightsList = form.highlightsText ? JSON.parse(form.highlightsText) : [];
    } catch (e) {
      toast({ title: "Highlights JSON invalid", description: "Make sure it is a valid JSON array like: [{\"label\":\"Key\",\"value\":\"Val\"}]", variant: "destructive" });
      return;
    }
    
    // Parse FAQs JSON
    let faqsList = [];
    try {
      faqsList = form.faqsText ? JSON.parse(form.faqsText) : [];
    } catch (e) {
      toast({ title: "FAQs JSON invalid", description: "Make sure it is a valid JSON array like: [{\"question\":\"Q?\",\"answer\":\"Ans\"}]", variant: "destructive" });
      return;
    }

    const payload = { 
      name: form.name, 
      description: form.description, 
      icon: form.icon, 
      image_url: form.image_url,
      category: form.category,
      tagline: form.tagline,
      features: featuresList,
      gallery_images: galleryList,
      highlights: highlightsList,
      faqs: faqsList
    };

    try {
      if (editId) {
        const { error } = await supabase.from("services").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Service updated!" });
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
        toast({ title: "Service created!" });
      }
      setForm(null);
      setEditId(null);
      fetchItems();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      name: item.name || "",
      icon: item.icon || "",
      image_url: item.image_url || "",
      description: item.description || "",
      category: item.category || "Event Production",
      tagline: item.tagline || "",
      featuresText: item.features ? item.features.join("\n") : "",
      galleryText: item.gallery_images ? item.gallery_images.join("\n") : "",
      highlightsText: item.highlights ? JSON.stringify(item.highlights, null, 2) : "[]",
      faqsText: item.faqs ? JSON.stringify(item.faqs, null, 2) : "[]"
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Service deleted" });
      fetchItems();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredItems = items.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const exportData = filteredItems.map(s => ({
      ID: s.id,
      Name: s.name,
      Category: s.category,
      Icon: s.icon || "N/A",
      "Image URL": s.image_url || "N/A",
      Description: s.description
    }));
    exportToExcel(exportData, "Services_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Service Name", key: "name" },
      { header: "Category", key: "category" },
      { header: "Icon", key: "icon" },
      { header: "Description", key: "description" }
    ];
    exportToPDF("Corporate Services Manifest", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header and export buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Services Portfolio ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ ...empty }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search services by title, keywords..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="pl-9"
        />
      </div>

      {/* Form Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Service</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Service Name *</label>
              <Input placeholder="Line Array Sound System" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Category (e.g., Event Production)</label>
              <Input placeholder="Event Production" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Icon Identifier (e.g., Speaker, Music, Volume2, Lightbulb)</label>
              <Input placeholder="Volume2" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Tagline</label>
              <Input placeholder="Crystal-clear audio for every scale" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground font-semibold">Hero Image URL</label>
              <div className="flex gap-2">
                <Input placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, image_url: url })} label="Choose File" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Features list (One feature per line)</label>
              <Textarea placeholder="Line array speakers&#10;Digital mixing consoles&#10;Wireless mics" rows={4} value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Gallery Images list (One URL per line)</label>
              <div className="flex flex-col gap-2">
                <Textarea placeholder="https://images.unsplash.com/img1&#10;https://images.unsplash.com/img2" rows={4} value={form.galleryText} onChange={(e) => setForm({ ...form, galleryText: e.target.value })} />
                <div className="flex justify-end">
                  <FileUpload onUpload={(url) => {
                    const current = form.galleryText ? form.galleryText.trim() : "";
                    const updated = current ? `${current}\n${url}` : url;
                    setForm({ ...form, galleryText: updated });
                  }} label="Add from device" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Highlights JSON (Array of label/value objects)</label>
              <Textarea placeholder='[&#10;  { "label": "Capacity", "value": "50 - 50,000+" }&#10;]' rows={4} value={form.highlightsText} onChange={(e) => setForm({ ...form, highlightsText: e.target.value })} className="font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">FAQs JSON (Array of question/answer objects)</label>
              <Textarea placeholder='[&#10;  { "question": "Provide sound engineers?", "answer": "Yes, standard." }&#10;]' rows={4} value={form.faqsText} onChange={(e) => setForm({ ...form, faqsText: e.target.value })} className="font-mono text-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Detailed Description</label>
            <Textarea placeholder="Explain key highlights of the event production service..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Service</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Services List Table - Desktop */}
      <div className="hidden md:block border border-border/40 rounded-xl overflow-hidden bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-3 font-semibold text-muted-foreground w-16">Icon</th>
                <th className="p-3 font-semibold text-muted-foreground">Service details</th>
                <th className="p-3 font-semibold text-muted-foreground">Category</th>
                <th className="p-3 font-semibold text-muted-foreground text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(s => (
                <tr key={s.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="p-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary flex items-center justify-center w-10 h-10 border border-primary/15">
                      <Settings className="h-4 w-4" />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{s.name}</div>
                    {s.icon && <div className="text-[10px] text-muted-foreground font-mono">Icon: {s.icon}</div>}
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-semibold bg-secondary/15 text-secondary px-2.5 py-1 rounded-full">{s.category}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Card list - Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredItems.map(s => (
          <div key={s.id} className="card-premium p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary flex items-center justify-center w-10 h-10 border border-primary/15 flex-shrink-0">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{s.name}</h4>
                  {s.icon && <p className="text-[10px] text-muted-foreground font-mono">Icon: {s.icon}</p>}
                </div>
              </div>
              <span className="text-xs font-semibold bg-secondary/15 text-secondary px-2.5 py-1 rounded-full flex-shrink-0">
                {s.category}
              </span>
            </div>
            <div className="flex justify-end gap-1.5 pt-2 border-t border-border/40">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(s.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No services found.</p>
        )}
      </div>
    </div>
  );
}