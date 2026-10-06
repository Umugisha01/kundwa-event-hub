import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Download, FileText, Search } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";

const emptyForm = {
  title: "",
  category: "Corporate Events",
  description: "",
  thumbnail: "",
  images: "",
  video_url: "",
  date: "",
  client: ""
};

export function AdminPortfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.warn("Could not fetch portfolio items:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const save = async () => {
    if (!form.title || !form.category || !form.thumbnail) {
      toast({ title: "Validation Error", description: "Title, Category, and Thumbnail are required.", variant: "destructive" });
      return;
    }

    // Convert comma-separated images string to array
    const imageArray = typeof form.images === "string" 
      ? form.images.split(",").map((s: string) => s.trim()).filter(Boolean)
      : form.images;

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      thumbnail: form.thumbnail,
      images: imageArray.length > 0 ? imageArray : [form.thumbnail], // Default to thumbnail if no images
      video_url: form.video_url || null,
      date: form.date || new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      client: form.client || null
    };

    try {
      if (editId) {
        const { error } = await supabase.from("portfolio").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Project updated successfully!" });
      } else {
        const { error } = await supabase.from("portfolio").insert(payload);
        if (error) throw error;
        toast({ title: "Project created successfully!" });
      }
      setForm(null);
      setEditId(null);
      fetchItems();
    } catch (err: any) {
      console.error("Database save failed:", err);
      toast({
        title: "Failed to save project",
        description: err?.message || "Could not save to the database. Please try again.",
        variant: "destructive"
      });
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from("portfolio").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Project deleted successfully." });
      fetchItems();
    } catch (err: any) {
      console.error("Delete failed on DB:", err);
      toast({ title: "Failed to Delete Project", description: err.message || "Database request could not be completed.", variant: "destructive" });
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || 
                          item.description?.toLowerCase().includes(search.toLowerCase()) ||
                          item.client?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filtering
  const categories = ["All", ...Array.from(new Set(items.map(i => i.category)))];

  // Report generation
  const handleExportExcel = () => {
    const dataToExport = filteredItems.map(item => ({
      ID: item.id,
      Title: item.title,
      Category: item.category,
      Client: item.client || "N/A",
      Date: item.date,
      "Video URL": item.video_url || "None",
      Thumbnail: item.thumbnail,
      Description: item.description
    }));
    exportToExcel(dataToExport, "Portfolio_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Project Title", key: "title" },
      { header: "Category", key: "category" },
      { header: "Client", key: "client" },
      { header: "Date", key: "date" },
      { header: "Description", key: "description" }
    ];
    exportToPDF("Portfolio Project Registry", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Portfolio Projects ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button className="btn-gold gap-1.5 flex-1 sm:flex-initial" onClick={() => { setForm({ ...emptyForm }); setEditId(null); }}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
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
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Add / Edit Form Modal-like Card */}
      {form && (
        <div className="card-premium p-6 space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground text-md">{editId ? "Edit" : "New"} Portfolio Project</h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Title *</label>
              <Input placeholder="Gala Dinner 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Category *</label>
              <Input placeholder="Corporate Events" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Client</label>
              <Input placeholder="e.g. MTN Rwanda" value={form.client || ""} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Date</label>
              <Input placeholder="e.g. October 2025" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Thumbnail Image URL *</label>
              <div className="flex gap-2">
                <Input placeholder="https://images.unsplash.com/..." value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, thumbnail: url })} label="Choose File" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Video Embed URL (optional)</label>
              <div className="flex gap-2">
                <Input placeholder="https://www.youtube.com/embed/... or direct MP4 URL" value={form.video_url || ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="flex-1" />
                <FileUpload onUpload={(url) => setForm({ ...form, video_url: url })} label="Choose Video" accept="video/*" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Additional Images URLs (comma-separated list)</label>
            <div className="flex gap-2">
              <Input 
                placeholder="url1, url2, url3" 
                value={Array.isArray(form.images) ? form.images.join(", ") : form.images} 
                onChange={(e) => setForm({ ...form, images: e.target.value })} 
                className="flex-1"
              />
              <FileUpload onUpload={(url) => {
                const currentImages = Array.isArray(form.images) 
                  ? form.images.join(", ") 
                  : (form.images || "");
                const trimmed = currentImages.trim();
                const updated = trimmed ? `${trimmed}, ${url}` : url;
                setForm({ ...form, images: updated });
              }} label="Add Image" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Description</label>
            <Textarea placeholder="Describe the project highlight, stages, production quality..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="btn-gold" onClick={save}>Save Project</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Projects Grid List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="card-premium p-4 flex gap-4 items-start">
            <div className="h-20 w-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { 
                    setForm({
                      ...item,
                      images: Array.isArray(item.images) ? item.images.join(", ") : item.images
                    }); 
                    setEditId(item.id); 
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-primary font-medium">{item.category}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
              <div className="flex justify-between text-[10px] text-muted-foreground/80 mt-2">
                <span>{item.date}</span>
                {item.client && <span>Client: {item.client}</span>}
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-2 text-center py-8">No portfolio projects found matching search filters.</p>
        )}
      </div>
    </div>
  );
}
