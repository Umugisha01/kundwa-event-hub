import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Download, 
  FileText, 
  Search, 
  CheckCircle, 
  Video, 
  Image as ImageIcon 
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";
import { parseVideoUrl } from "@/utils/videoEmbed";

interface PortfolioFormState {
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  additionalImages: string[];
  video_url: string;
  date: string;
  client: string;
}

const emptyForm: PortfolioFormState = {
  title: "",
  category: "Corporate Events",
  description: "",
  thumbnail: "",
  additionalImages: [],
  video_url: "",
  date: "",
  client: ""
};

export function AdminPortfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<PortfolioFormState | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [extraImageUrl, setExtraImageUrl] = useState("");

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

  const handleAddExtraImage = () => {
    const trimmed = extraImageUrl.trim();
    if (!trimmed) return;
    if (form) {
      setForm({
        ...form,
        additionalImages: [...(form.additionalImages || []), trimmed]
      });
      setExtraImageUrl("");
    }
  };

  const handleRemoveExtraImage = (indexToRemove: number) => {
    if (!form) return;
    setForm({
      ...form,
      additionalImages: form.additionalImages.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const save = async () => {
    if (!form) return;

    if (!form.title.trim() || !form.category.trim() || !form.thumbnail.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Title, Category, and Thumbnail are required.", 
        variant: "destructive" 
      });
      return;
    }

    // Additional images are strictly optional.
    const validExtraImages = (form.additionalImages || [])
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description?.trim() || "",
      thumbnail: form.thumbnail.trim(),
      images: validExtraImages, // Optional extra images list
      video_url: form.video_url?.trim() || null,
      date: form.date?.trim() || new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      client: form.client?.trim() || null
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
      setExtraImageUrl("");
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
      "Additional Images": Array.isArray(item.images) ? item.images.length : 0,
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

  // Detected video platform info for current form input
  const detectedVideo = form?.video_url ? parseVideoUrl(form.video_url) : null;

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
          <Button 
            className="btn-gold gap-1.5 flex-1 sm:flex-initial" 
            onClick={() => { 
              setForm({ ...emptyForm, additionalImages: [] }); 
              setEditId(null); 
              setExtraImageUrl("");
            }}
          >
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
        <div className="card-premium p-6 space-y-5 animate-scale-in border border-border/80 shadow-xl">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-lg">{editId ? "Edit" : "New"} Portfolio Project</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configure project details, cover photo, optional video link, and optional gallery.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Title *</label>
              <Input 
                placeholder="e.g. Hyssop Choir Concert" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Category *</label>
              <Input 
                placeholder="e.g. Corporate Events, Music Concerts..." 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Client (Optional)</label>
              <Input 
                placeholder="e.g. MTN Rwanda, ZAMARI, etc." 
                value={form.client || ""} 
                onChange={(e) => setForm({ ...form, client: e.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-semibold">Date</label>
              <Input 
                placeholder="e.g. October 2025" 
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
              />
            </div>

            {/* Thumbnail URL (Required primary cover) */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                <span>Main Thumbnail Cover Image *</span>
                {form.thumbnail && <span className="text-[11px] text-emerald-500 font-medium">Cover image set</span>}
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://images.unsplash.com/... or uploaded file" 
                  value={form.thumbnail} 
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} 
                  className="flex-1" 
                />
                <FileUpload onUpload={(url) => setForm({ ...form, thumbnail: url })} label="Choose File" />
              </div>
              {form.thumbnail && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-muted/30 rounded-lg border border-border/40">
                  <img 
                    src={resolveMediaUrl(form.thumbnail)} 
                    alt="Cover preview" 
                    className="w-16 h-12 object-cover rounded border" 
                  />
                  <div className="text-xs text-muted-foreground truncate">
                    <p className="font-medium text-foreground">Main Cover Photo</p>
                    <p className="truncate max-w-sm">{form.thumbnail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Link (Universal: YouTube, Instagram, TikTok, Vimeo, Facebook, Direct MP4/MOV) */}
            <div className="space-y-1.5 sm:col-span-2 p-4 bg-muted/20 border border-border/60 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-500" />
                  Video Link / URL <span className="text-muted-foreground/70 font-normal">(Optional)</span>
                </label>
                {detectedVideo && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    {detectedVideo.platformName} detected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Paste YouTube, Instagram Reel, TikTok, Vimeo, Facebook, or video URL..." 
                  value={form.video_url || ""} 
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })} 
                  className="flex-1 text-xs" 
                />
                <FileUpload 
                  onUpload={(url) => setForm({ ...form, video_url: url })} 
                  label="Upload Video" 
                  accept="video/*" 
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Paste any link from <strong className="text-foreground">YouTube</strong> (standard or short link), <strong className="text-foreground">Instagram Reel</strong>, <strong className="text-foreground">TikTok</strong>, <strong className="text-foreground">Vimeo</strong>, <strong className="text-foreground">Facebook</strong>, or upload a video file (.mp4, .mov). The player embeds automatically.
              </p>
            </div>
          </div>

          {/* Additional Gallery Images (100% Optional) */}
          <div className="space-y-2.5 p-4 bg-muted/15 border border-border/60 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Additional Gallery Images <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Add extra photos if you want a multi-photo gallery slider. If left empty, only the main thumbnail will be displayed.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                {form.additionalImages?.length || 0} extra {form.additionalImages?.length === 1 ? "photo" : "photos"}
              </span>
            </div>

            {/* Existing Additional Images Preview Strip */}
            {form.additionalImages && form.additionalImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                {form.additionalImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-border h-20 bg-muted/40 shadow-sm">
                    <img 
                      src={resolveMediaUrl(imgUrl)} 
                      alt={`Extra ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraImage(idx)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/80 italic bg-background/50 border border-dashed border-border/70 rounded-lg p-3 text-center">
                No additional gallery images added (Optional — the project will showcase only the main thumbnail).
              </div>
            )}

            {/* Add Extra Image Controls */}
            <div className="flex gap-2 pt-1">
              <Input 
                placeholder="Paste extra image URL..." 
                value={extraImageUrl} 
                onChange={(e) => setExtraImageUrl(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExtraImage();
                  }
                }}
                className="flex-1 text-xs" 
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddExtraImage}
                disabled={!extraImageUrl.trim()}
              >
                Add URL
              </Button>
              <FileUpload 
                onUpload={(url) => {
                  setForm(prev => prev ? ({
                    ...prev,
                    additionalImages: [...(prev.additionalImages || []), url]
                  }) : null);
                }} 
                label="Upload Photo" 
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-semibold">Description</label>
            <Textarea 
              placeholder="Describe the project highlight, stages, production quality, lighting setup..." 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button className="btn-gold" onClick={save}>Save Project</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Projects Grid List */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const itemVideo = item.video_url ? parseVideoUrl(item.video_url) : null;
          const extraCount = Array.isArray(item.images) 
            ? item.images.filter((img: string) => img && img !== item.thumbnail).length 
            : 0;

          return (
            <div key={item.id} className="card-premium p-4 flex gap-4 items-start">
              <div className="h-20 w-28 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                <img 
                  src={resolveMediaUrl(item.thumbnail)} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                />
                {item.video_url && (
                  <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    Video
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                  <div className="flex gap-0.5">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => { 
                        const extraImages = (Array.isArray(item.images) ? item.images : [])
                          .filter((img: string) => img && img !== item.thumbnail);

                        setForm({
                          title: item.title || "",
                          category: item.category || "Corporate Events",
                          description: item.description || "",
                          thumbnail: item.thumbnail || "",
                          additionalImages: extraImages,
                          video_url: item.video_url || "",
                          date: item.date || "",
                          client: item.client || ""
                        }); 
                        setEditId(item.id); 
                        setExtraImageUrl("");
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive" 
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-primary font-medium">{item.category}</p>
                  {extraCount > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      +{extraCount} photos
                    </span>
                  )}
                  {itemVideo && (
                    <span className="text-[10px] text-red-500 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded">
                      {itemVideo.platformName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                <div className="flex justify-between text-[10px] text-muted-foreground/80 mt-2">
                  <span>{item.date}</span>
                  {item.client && <span>Client: {item.client}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-2 text-center py-8">
            No portfolio projects found matching search filters.
          </p>
        )}
      </div>
    </div>
  );
}
