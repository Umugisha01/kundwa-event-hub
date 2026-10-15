import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, Edit2, Trash2, X, Download, FileText, Search, Settings, 
  ArrowLeft, ArrowRight, Layers, Sparkles, Check, ChevronRight,
  ExternalLink, Image as ImageIcon, HelpCircle, BarChart3, ListChecks,
  Eye, FolderPlus, Palette, Tag, ShieldAlert
} from "lucide-react";
import * as Icons from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";
import { resolveMediaUrl } from "@/config/api";
import { Link } from "react-router-dom";

// Helper for dynamic Lucide icon rendering
const DynamicIcon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return <Settings className={className} />;
  const IconComponent = (Icons as any)[name] || Icons.Settings;
  return <IconComponent className={className} />;
};

const POPULAR_ICONS = [
  "Volume2", "Lightbulb", "Layers", "Sparkles", "Megaphone", "Ticket", 
  "Briefcase", "Monitor", "Music", "Video", "Zap", "Shield", "Star", 
  "Camera", "Radio", "Tv", "Mic", "RadioReceiver", "Sliders", "Disc"
];

const COLOR_PRESETS = [
  { label: "Indigo & Sky", value: "from-primary/80 to-primary", bg: "bg-blue-600" },
  { label: "Gold & Amber", value: "from-secondary/80 to-secondary", bg: "bg-amber-500" },
  { label: "Dark & Slate", value: "from-foreground/70 to-foreground/90", bg: "bg-slate-700" },
  { label: "Purple & Pink", value: "from-purple-600/80 to-pink-600", bg: "bg-purple-600" },
  { label: "Emerald & Teal", value: "from-emerald-600/80 to-teal-600", bg: "bg-emerald-600" },
];

interface MainServiceItem {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  image_url: string;
  order: number;
  color: string;
  cta_text: string;
  items_count?: number;
}

interface HighlightItem {
  label: string;
  value: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceItem {
  id?: string;
  name: string;
  category: string;
  slug?: string;
  tagline: string;
  description: string;
  icon: string;
  image_url: string;
  gallery_images: string[];
  features: string[];
  highlights: HighlightItem[];
  faqs: FaqItem[];
}

const emptyMainService: MainServiceItem = {
  title: "",
  description: "",
  image_url: "",
  order: 1,
  color: "from-primary/80 to-primary",
  cta_text: ""
};

const emptyService: ServiceItem = {
  name: "",
  category: "Event Production",
  tagline: "",
  description: "",
  icon: "Sparkles",
  image_url: "",
  gallery_images: [],
  features: ["Professional on-site crew", "Complete equipment setup & sound-check", "Dedicated technical director"],
  highlights: [
    { label: "Capacity", value: "50 – 5,000+ Guests" },
    { label: "Setup Time", value: "Same-day Ready" },
    { label: "Team", value: "Certified Crew" },
    { label: "Support", value: "24/7 On-site" }
  ],
  faqs: [
    { question: "How early do you set up?", answer: "We coordinate setup 3 to 12 hours prior to doors opening." }
  ]
};

export function AdminServices() {
  // Navigation View: "main_services" (categories) or "sub_services" (individual items)
  const [activeTab, setActiveTab] = useState<"main_services" | "sub_services">("main_services");
  
  // Data state
  const [mainServices, setMainServices] = useState<MainServiceItem[]>([]);
  const [subServices, setSubServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Main Service Form State
  const [mainForm, setMainForm] = useState<MainServiceItem | null>(null);
  const [editingMainId, setEditingMainId] = useState<string | null>(null);

  // Sub-Service Form State
  const [serviceForm, setServiceForm] = useState<ServiceItem | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Main Services
      const { data: msData, error: msError } = await supabase
        .from("main_services")
        .select("*")
        .order("order");

      if (msError) {
        console.warn("Main services table query error:", msError);
      }

      // 2. Fetch Sub-Services
      const { data: sData, error: sError } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (sError) throw sError;

      const servicesList: ServiceItem[] = (sData || []).map((s: any) => ({
        ...s,
        features: Array.isArray(s.features) ? s.features : [],
        gallery_images: Array.isArray(s.gallery_images) ? s.gallery_images : [],
        highlights: Array.isArray(s.highlights) ? s.highlights : [],
        faqs: Array.isArray(s.faqs) ? s.faqs : []
      }));
      setSubServices(servicesList);

      // If main_services exists in backend, use it; otherwise fallback from unique categories
      if (msData && msData.length > 0) {
        // compute items count per main service
        const computed = msData.map((m: any) => ({
          ...m,
          items_count: servicesList.filter(s => s.category === m.title).length
        }));
        setMainServices(computed);
      } else {
        // Derive from existing sub-services
        const derivedCategories = Array.from(new Set(servicesList.map(s => s.category || "Event Production")));
        const fallbackMain: MainServiceItem[] = derivedCategories.map((title, idx) => ({
          title,
          order: idx + 1,
          description: `Comprehensive solutions for ${title.toLowerCase()}.`,
          image_url: servicesList.find(s => s.category === title)?.image_url || "/assets/hero-event.jpg",
          color: idx === 0 ? "from-primary/80 to-primary" : idx === 1 ? "from-secondary/80 to-secondary" : "from-foreground/70 to-foreground/90",
          cta_text: `Inquire About ${title}`,
          items_count: servicesList.filter(s => s.category === title).length
        }));
        setMainServices(fallbackMain);
      }
    } catch (err: any) {
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category list for dropdowns
  const availableCategories = useMemo(() => {
    const fromMain = mainServices.map(m => m.title);
    const fromSubs = subServices.map(s => s.category);
    return Array.from(new Set([...fromMain, ...fromSubs])).filter(Boolean);
  }, [mainServices, subServices]);

  // Jump from Main Service card to its sub-services
  const handleViewCategoryItems = (catTitle: string) => {
    setSelectedCategory(catTitle);
    setActiveTab("sub_services");
    setServiceForm(null);
  };

  // -------------------------------------------------------------
  // MAIN SERVICES CRUD
  // -------------------------------------------------------------
  const openNewMainService = () => {
    setMainForm({
      ...emptyMainService,
      order: mainServices.length + 1
    });
    setEditingMainId(null);
  };

  const openEditMainService = (item: MainServiceItem) => {
    setEditingMainId(item.id || null);
    setMainForm({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url || "",
      order: item.order || 1,
      color: item.color || "from-primary/80 to-primary",
      cta_text: item.cta_text || `Inquire About ${item.title}`
    });
  };

  const saveMainService = async () => {
    if (!mainForm?.title?.trim()) {
      toast({ title: "Main Service Title is required", variant: "destructive" });
      return;
    }

    const payload = {
      title: mainForm.title.trim(),
      description: mainForm.description,
      image_url: mainForm.image_url,
      order: Number(mainForm.order) || 1,
      color: mainForm.color || "from-primary/80 to-primary",
      cta_text: mainForm.cta_text || `Inquire About ${mainForm.title.trim()}`
    };

    try {
      if (editingMainId) {
        const { error } = await supabase.from("main_services").update(payload).eq("id", editingMainId);
        if (error) throw error;
        toast({ title: "Main Service package updated!" });
      } else {
        const { error } = await supabase.from("main_services").insert(payload);
        if (error) throw error;
        toast({ title: "Main Service package created!" });
      }
      setMainForm(null);
      setEditingMainId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteMainService = async (item: MainServiceItem) => {
    const includedCount = subServices.filter(s => s.category === item.title).length;
    const confirmMsg = includedCount > 0
      ? `Are you sure you want to delete "${item.title}"? This main service contains ${includedCount} included service(s), which will also be removed!`
      : `Are you sure you want to delete "${item.title}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (item.id) {
        const { error } = await supabase.from("main_services").delete().eq("id", item.id);
        if (error) throw error;
      }
      toast({ title: `Main Service "${item.title}" deleted!` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // -------------------------------------------------------------
  // SUB-SERVICES CRUD
  // -------------------------------------------------------------
  const openNewSubService = (defaultCat?: string) => {
    const chosenCat = defaultCat || (selectedCategory !== "ALL" ? selectedCategory : (availableCategories[0] || "Event Production"));
    setServiceForm({
      ...emptyService,
      category: chosenCat
    });
    setEditingServiceId(null);
  };

  const openEditSubService = (item: ServiceItem) => {
    setEditingServiceId(item.id || null);
    setServiceForm({
      name: item.name || "",
      category: item.category || "Event Production",
      slug: item.slug || "",
      tagline: item.tagline || "",
      description: item.description || "",
      icon: item.icon || "Sparkles",
      image_url: item.image_url || "",
      gallery_images: Array.isArray(item.gallery_images) ? [...item.gallery_images] : [],
      features: Array.isArray(item.features) ? [...item.features] : [],
      highlights: Array.isArray(item.highlights) ? [...item.highlights] : [],
      faqs: Array.isArray(item.faqs) ? [...item.faqs] : []
    });
  };

  const saveSubService = async () => {
    if (!serviceForm?.name?.trim()) {
      toast({ title: "Service Name is required", variant: "destructive" });
      return;
    }
    if (!serviceForm?.category?.trim()) {
      toast({ title: "Category is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: serviceForm.name.trim(),
      category: serviceForm.category.trim(),
      tagline: serviceForm.tagline,
      description: serviceForm.description,
      icon: serviceForm.icon || "Sparkles",
      image_url: serviceForm.image_url,
      features: serviceForm.features,
      highlights: serviceForm.highlights,
      gallery_images: serviceForm.gallery_images,
      faqs: serviceForm.faqs
    };

    try {
      if (editingServiceId) {
        const { error } = await supabase.from("services").update(payload).eq("id", editingServiceId);
        if (error) throw error;
        toast({ title: "Service updated successfully!" });
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
        toast({ title: "Service created successfully!" });
      }
      setServiceForm(null);
      setEditingServiceId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteSubService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      toast({ title: `Service "${name}" deleted` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // Filtered Sub Services
  const filteredSubServices = subServices.filter(s => {
    const matchesCat = selectedCategory === "ALL" || s.category === selectedCategory;
    const matchesSearch = !search.trim() || 
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.tagline?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Main Services
  const filteredMainServices = mainServices.filter(m => 
    !search.trim() ||
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Export handlers
  const handleExportExcel = () => {
    if (activeTab === "main_services") {
      const exportData = filteredMainServices.map(m => ({
        Order: m.order,
        "Main Service Package": m.title,
        "Included Services Count": m.items_count || 0,
        "CTA Button": m.cta_text,
        Description: m.description
      }));
      exportToExcel(exportData, "Main_Services_Packages");
    } else {
      const exportData = filteredSubServices.map(s => ({
        ID: s.id,
        "Service Name": s.name,
        "Main Category": s.category,
        Tagline: s.tagline,
        Icon: s.icon,
        "Features Count": s.features?.length || 0,
        "Highlights Count": s.highlights?.length || 0,
        Description: s.description
      }));
      exportToExcel(exportData, "Services_Items_Report");
    }
  };

  const handleExportPDF = () => {
    if (activeTab === "main_services") {
      const columns = [
        { header: "Order", key: "order" },
        { header: "Title", key: "title" },
        { header: "Included Services", key: "items_count" },
        { header: "Description", key: "description" }
      ];
      exportToPDF("Main Services Packages", columns, filteredMainServices);
    } else {
      const columns = [
        { header: "Service Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "Tagline", key: "tagline" },
        { header: "Description", key: "description" }
      ];
      exportToPDF("Included Services Directory", columns, filteredSubServices);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar with Tab Switcher & Quick Actions ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/60 p-4 md:p-5 rounded-2xl border border-border/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">Services Management</h1>
              <p className="text-xs text-muted-foreground">
                Manage Main Production Packages & all detailed sub-services included in them
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Segmented Pill Switcher */}
          <div className="flex p-1 bg-muted/60 rounded-xl border border-border/60">
            <button
              onClick={() => { setActiveTab("main_services"); setMainForm(null); setServiceForm(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "main_services"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderPlus className="h-3.5 w-3.5 text-blue-600" />
              <span>Main Services ({mainServices.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("sub_services"); setMainForm(null); setServiceForm(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "sub_services"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Included Services ({subServices.length})</span>
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-9 gap-1.5 text-xs rounded-xl">
            <Download className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 gap-1.5 text-xs rounded-xl">
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>

          {activeTab === "main_services" ? (
            <Button onClick={openNewMainService} className="h-9 gap-1.5 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
              <Plus className="h-3.5 w-3.5" /> Add Main Service
            </Button>
          ) : (
            <Button onClick={() => openNewSubService()} className="h-9 gap-1.5 text-xs rounded-xl btn-gold font-bold">
              <Plus className="h-3.5 w-3.5" /> Add Service
            </Button>
          )}
        </div>
      </div>

      {/* ── Search Bar & Filter Strip ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "main_services"
                ? "Search main services (e.g., Event Production, Management)..."
                : "Search included services by name, tagline, features, category..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/60"
          />
        </div>

        {/* Category filter pills when viewing sub-services */}
        {activeTab === "sub_services" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground border-border/60"
              }`}
            >
              All Categories ({subServices.length})
            </button>
            {availableCategories.map((cat) => {
              const count = subServices.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? "bg-secondary text-secondary-foreground border-secondary font-bold"
                      : "bg-card text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Breadcrumb banner if filtered to a specific category in sub-services */}
      {activeTab === "sub_services" && selectedCategory !== "ALL" && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <button 
              onClick={() => setActiveTab("main_services")} 
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Main Services
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Viewing items inside: <strong className="text-blue-600">{selectedCategory}</strong> ({filteredSubServices.length} items)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs rounded-lg"
              onClick={() => setSelectedCategory("ALL")}
            >
              Show All
            </Button>
            <Button 
              size="sm" 
              className="h-7 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1"
              onClick={() => openNewSubService(selectedCategory)}
            >
              <Plus className="h-3 w-3" /> Add item to {selectedCategory}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ── VIEW 1: MAIN SERVICES PACKAGES (CATEGORIES) ── */}
      {/* ========================================================= */}
      {activeTab === "main_services" && (
        <div className="space-y-6">
          {/* Main Service Form (Add / Edit) */}
          {mainForm && (
            <div className="card-premium p-6 rounded-2xl border border-blue-500/30 bg-card shadow-xl space-y-5 animate-scale-in">
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
                    <FolderPlus className="h-4 w-4" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-base">
                    {editingMainId ? "Edit Main Service Package" : "Add New Main Service Package"}
                  </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMainForm(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold flex items-center gap-1">
                    Main Service Title * <span className="text-muted-foreground font-normal">(e.g., Event Production, Event Management)</span>
                  </label>
                  <Input
                    placeholder="Event Production"
                    value={mainForm.title}
                    onChange={(e) => setMainForm({ ...mainForm, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold flex items-center gap-1">
                    Display Order Index <span className="text-muted-foreground font-normal">(e.g., 1 for 01, 2 for 02)</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={mainForm.order}
                    onChange={(e) => setMainForm({ ...mainForm, order: parseInt(e.target.value) || 1 })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-foreground font-bold">Description Summary</label>
                  <Textarea
                    placeholder="From sound systems to lighting and custom stage design, we deliver world-class production for every scale."
                    rows={2}
                    value={mainForm.description}
                    onChange={(e) => setMainForm({ ...mainForm, description: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-foreground font-bold">Cover Image (Shown in Services section)</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="/assets/hero-event.jpg or https://images.unsplash.com/..."
                      value={mainForm.image_url}
                      onChange={(e) => setMainForm({ ...mainForm, image_url: e.target.value })}
                      className="rounded-xl flex-1"
                    />
                    <FileUpload onUpload={(url) => setMainForm({ ...mainForm, image_url: url })} label="Upload Image" />
                  </div>
                  {mainForm.image_url && (
                    <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-border/70 relative">
                      <img
                        src={resolveMediaUrl(mainForm.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold">CTA Button Text</label>
                  <Input
                    placeholder={`Inquire About ${mainForm.title || "This Service"}`}
                    value={mainForm.cta_text}
                    onChange={(e) => setMainForm({ ...mainForm, cta_text: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold">Accent Color / Gradient Preset</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setMainForm({ ...mainForm, color: preset.value })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                          mainForm.color === preset.value
                            ? "border-blue-600 bg-blue-600/10 font-bold"
                            : "border-border/60 hover:border-border"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${preset.bg}`} />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button className="btn-gold font-bold" onClick={saveMainService}>
                  Save Main Service
                </Button>
                <Button variant="outline" onClick={() => setMainForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Main Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMainServices.map((ms, idx) => {
              const count = subServices.filter(s => s.category === ms.title).length;
              const displayOrder = ms.order ? String(ms.order).padStart(2, "0") : String(idx + 1).padStart(2, "0");
              const previewImage = ms.image_url || subServices.find(s => s.category === ms.title)?.image_url || "/assets/hero-event.jpg";

              return (
                <div
                  key={ms.id || ms.title}
                  className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <img
                        src={resolveMediaUrl(previewImage)}
                        alt={ms.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white font-mono text-xs px-2.5 py-1 rounded-full border border-white/20">
                          {displayOrder}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <h3 className="font-extrabold text-white text-lg drop-shadow-sm leading-tight">
                            {ms.title}
                          </h3>
                        </div>
                        <span className="bg-secondary/90 text-secondary-foreground font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                          {count} {count === 1 ? "service" : "services"} included
                        </span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {ms.description || "No description provided."}
                      </p>

                      {/* Included Services Quick Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                          Included Services:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {subServices.filter(s => s.category === ms.title).map(item => (
                            <span 
                              key={item.id || item.name} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground border border-border/50"
                            >
                              <DynamicIcon name={item.icon} className="h-3 w-3 text-secondary shrink-0" />
                              <span className="truncate max-w-[120px]">{item.name}</span>
                            </span>
                          ))}
                          {count === 0 && (
                            <span className="text-xs text-muted-foreground italic">
                              No services yet. Click manage to add items!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold rounded-xl h-8 flex-1 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-600/30"
                      onClick={() => handleViewCategoryItems(ms.title)}
                    >
                      <span>Manage Items ({count})</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg"
                        title="Edit Main Service"
                        onClick={() => openEditMainService(ms)}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete Main Service"
                        onClick={() => deleteMainService(ms)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMainServices.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-border/70 rounded-2xl p-6 bg-card/40">
                <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="font-bold text-foreground text-sm">No Main Services Found</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Create a main service package to organize your production and event services.
                </p>
                <Button onClick={openNewMainService} className="mt-4 btn-gold text-xs font-bold rounded-xl gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add First Main Service
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ── VIEW 2: INCLUDED SERVICES & ITEMS ── */}
      {/* ========================================================= */}
      {activeTab === "sub_services" && (
        <div className="space-y-6">
          {/* Sub Service Form (Add / Edit) */}
          {serviceForm && (
            <div className="card-premium p-6 rounded-2xl border border-secondary/40 bg-card shadow-2xl space-y-6 animate-scale-in">
              <div className="flex justify-between items-center border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary font-bold">
                    <DynamicIcon name={serviceForm.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base">
                      {editingServiceId ? `Edit Service: ${serviceForm.name}` : "Create New Sub-Service"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Parent Package: <span className="text-secondary font-bold">{serviceForm.category}</span>
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setServiceForm(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Basic Details */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold">Service Name *</label>
                  <Input
                    placeholder="e.g. Line Array Sound System"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold">Main Category (Parent Package) *</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-border/60 bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-foreground font-bold">Tagline</label>
                  <Input
                    placeholder="e.g. Crystal-clear audio for every scale"
                    value={serviceForm.tagline}
                    onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                {/* Icon Selection */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-foreground font-bold flex items-center gap-2">
                      Service Icon 
                      <span className="text-[10px] text-muted-foreground font-normal">(Pick from popular or type Lucide icon name)</span>
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Selected:</span>
                      <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {serviceForm.icon || "Sparkles"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Icon presets strip */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-muted/40 rounded-xl border border-border/50 max-h-24 overflow-y-auto">
                    {POPULAR_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setServiceForm({ ...serviceForm, icon: ic })}
                        className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs ${
                          serviceForm.icon === ic
                            ? "bg-secondary text-secondary-foreground border-secondary font-bold shadow-xs"
                            : "bg-card text-muted-foreground hover:text-foreground border-border/40"
                        }`}
                        title={ic}
                      >
                        <DynamicIcon name={ic} className="h-4 w-4" />
                        <span className="text-[10px] hidden sm:inline">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Image */}
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <label className="text-xs text-foreground font-bold">Hero Cover Image URL</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="https://... or /assets/..."
                      value={serviceForm.image_url}
                      onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                      className="rounded-xl flex-1"
                    />
                    <FileUpload onUpload={(url) => setServiceForm({ ...serviceForm, image_url: url })} label="Upload Image" />
                  </div>
                  {serviceForm.image_url && (
                    <div className="mt-2 w-36 h-20 rounded-xl overflow-hidden border border-border/70 relative">
                      <img src={resolveMediaUrl(serviceForm.image_url)} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Key Highlights / Metrics Row (4 Metrics displayed on ServiceDetail) ── */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-secondary" />
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                      Key Highlights & Stats (Metrics Bar)
                    </h4>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-lg gap-1"
                    onClick={() => {
                      const updated = [...(serviceForm.highlights || []), { label: "Metric", value: "Value" }];
                      setServiceForm({ ...serviceForm, highlights: updated });
                    }}
                  >
                    <Plus className="h-3 w-3" /> Add Highlight
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Displayed as the 4 prominent stat cards on the service details page (e.g., FIXTURES: 200+ Available, SETUP: Same-day Ready).
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(serviceForm.highlights || []).map((h, hIdx) => (
                    <div key={hIdx} className="p-3 bg-card rounded-xl border border-border/60 space-y-2 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = serviceForm.highlights.filter((_, i) => i !== hIdx);
                          setServiceForm({ ...serviceForm, highlights: updated });
                        }}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded"
                        title="Remove highlight"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold uppercase">Label</label>
                        <Input
                          placeholder="e.g. FIXTURES"
                          value={h.label}
                          onChange={(e) => {
                            const updated = [...serviceForm.highlights];
                            updated[hIdx].label = e.target.value;
                            setServiceForm({ ...serviceForm, highlights: updated });
                          }}
                          className="h-8 text-xs rounded-lg mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold uppercase">Value</label>
                        <Input
                          placeholder="e.g. 200+ Available"
                          value={h.value}
                          onChange={(e) => {
                            const updated = [...serviceForm.highlights];
                            updated[hIdx].value = e.target.value;
                            setServiceForm({ ...serviceForm, highlights: updated });
                          }}
                          className="h-8 text-xs rounded-lg font-bold mt-0.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Features Checklist & Detailed Description ── */}
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Features List */}
                <div className="space-y-2.5 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="h-4 w-4 text-secondary" />
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Features Checklist</h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {serviceForm.features?.length || 0} features
                    </span>
                  </div>

                  {/* Add Feature input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a bullet feature..."
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newFeatureText.trim()) {
                          e.preventDefault();
                          setServiceForm({
                            ...serviceForm,
                            features: [...(serviceForm.features || []), newFeatureText.trim()]
                          });
                          setNewFeatureText("");
                        }
                      }}
                      className="h-8 text-xs rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newFeatureText.trim()) {
                          setServiceForm({
                            ...serviceForm,
                            features: [...(serviceForm.features || []), newFeatureText.trim()]
                          });
                          setNewFeatureText("");
                        }
                      }}
                      className="h-8 text-xs px-2.5 rounded-lg"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Features items */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(serviceForm.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border/40 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Check className="h-3 w-3 text-secondary shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = serviceForm.features.filter((_, i) => i !== fIdx);
                            setServiceForm({ ...serviceForm, features: updated });
                          }}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-2 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Detailed Description</h4>
                  <Textarea
                    placeholder="Comprehensive explanation of what this service covers, technical capabilities, equipment brands, certified personnel, etc."
                    rows={7}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="rounded-xl text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* ── Gallery Images & FAQs ── */}
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Gallery Images */}
                <div className="space-y-2.5 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-secondary" />
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Gallery Images</h4>
                    </div>
                    <FileUpload
                      onUpload={(url) => {
                        setServiceForm({
                          ...serviceForm,
                          gallery_images: [...(serviceForm.gallery_images || []), url]
                        });
                      }}
                      label="Upload to Gallery"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Or paste an image URL..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      className="h-8 text-xs rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (newGalleryUrl.trim()) {
                          setServiceForm({
                            ...serviceForm,
                            gallery_images: [...(serviceForm.gallery_images || []), newGalleryUrl.trim()]
                          });
                          setNewGalleryUrl("");
                        }
                      }}
                      className="h-8 text-xs px-2.5 rounded-lg"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Image thumbnails */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                    {(serviceForm.gallery_images || []).map((imgUrl, gIdx) => (
                      <div key={gIdx} className="relative h-16 rounded-lg overflow-hidden border border-border group">
                        <img src={resolveMediaUrl(imgUrl)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = serviceForm.gallery_images.filter((_, i) => i !== gIdx);
                            setServiceForm({ ...serviceForm, gallery_images: updated });
                          }}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-destructive text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs Builder */}
                <div className="space-y-2.5 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-secondary" />
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Frequently Asked Questions</h4>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs rounded-lg gap-1"
                      onClick={() => {
                        const updated = [...(serviceForm.faqs || []), { question: "New Question?", answer: "Answer details." }];
                        setServiceForm({ ...serviceForm, faqs: updated });
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {(serviceForm.faqs || []).map((faq, faqIdx) => (
                      <div key={faqIdx} className="p-2.5 bg-card rounded-lg border border-border/50 space-y-1.5 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = serviceForm.faqs.filter((_, i) => i !== faqIdx);
                            setServiceForm({ ...serviceForm, faqs: updated });
                          }}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <Input
                          placeholder="Question?"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...serviceForm.faqs];
                            updated[faqIdx].question = e.target.value;
                            setServiceForm({ ...serviceForm, faqs: updated });
                          }}
                          className="h-7 text-xs font-semibold rounded-md pr-6"
                        />
                        <Input
                          placeholder="Answer details..."
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...serviceForm.faqs];
                            updated[faqIdx].answer = e.target.value;
                            setServiceForm({ ...serviceForm, faqs: updated });
                          }}
                          className="h-7 text-xs rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button className="btn-gold font-bold px-6" onClick={saveSubService}>
                  Save Service
                </Button>
                <Button variant="outline" onClick={() => setServiceForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Sub Services Table (Desktop) */}
          <div className="hidden md:block border border-border/60 rounded-2xl overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="p-3.5 font-bold text-muted-foreground w-14">Icon</th>
                    <th className="p-3.5 font-bold text-muted-foreground">Service Name & Tagline</th>
                    <th className="p-3.5 font-bold text-muted-foreground">Parent Package</th>
                    <th className="p-3.5 font-bold text-muted-foreground">Highlights / Features</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredSubServices.map((s) => (
                    <tr key={s.id || s.name} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/20">
                          <DynamicIcon name={s.icon} className="h-5 w-5" />
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-extrabold text-foreground">{s.name}</div>
                        {s.tagline && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{s.tagline}</div>
                        )}
                        <div className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                          Icon: {s.icon || "Sparkles"}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-xs font-bold bg-blue-600/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-600/20">
                          {s.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5 text-secondary" />
                            <strong>{s.highlights?.length || 0}</strong> stats
                          </span>
                          <span className="flex items-center gap-1">
                            <ListChecks className="h-3.5 w-3.5 text-secondary" />
                            <strong>{s.features?.length || 0}</strong> bullets
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex justify-end items-center gap-1">
                          {s.slug && (
                            <Link to={`/services/${s.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Public Page">
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Edit Service"
                            onClick={() => openEditSubService(s)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            title="Delete Service"
                            onClick={() => deleteSubService(s.id!, s.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredSubServices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">
                        No services found in this category. Click &quot;Add Service&quot; to create one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub Services Cards (Mobile View) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredSubServices.map((s) => (
              <div key={s.id || s.name} className="card-premium p-4 rounded-xl border border-border/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/20 shrink-0">
                      <DynamicIcon name={s.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm">{s.name}</h4>
                      {s.tagline && <p className="text-xs text-muted-foreground line-clamp-1">{s.tagline}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full border border-blue-600/20 shrink-0">
                    {s.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <div className="text-muted-foreground">
                    {s.features?.length || 0} features · {s.highlights?.length || 0} stats
                  </div>
                  <div className="flex items-center gap-1">
                    {s.slug && (
                      <Link to={`/services/${s.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSubService(s)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSubService(s.id!, s.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}