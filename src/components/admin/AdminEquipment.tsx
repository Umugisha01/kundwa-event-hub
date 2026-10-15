import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Plus, Edit2, Trash2, X, Download, FileText, Search, 
  ShieldCheck, ShieldAlert, Image as ImageIcon, Eye, 
  Tag, FolderPlus, CheckCircle2, Clock, Check, Layers,
  Volume2, Lightbulb, Monitor, Wrench, Sparkles, Filter
} from "lucide-react";
import * as Icons from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { FileUpload } from "./FileUpload";
import { resolveMediaUrl } from "@/config/api";

// Helper for dynamic icon rendering
const DynamicIcon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return <Wrench className={className} />;
  const IconComponent = (Icons as any)[name] || Icons.Wrench;
  return <IconComponent className={className} />;
};

const POPULAR_CAT_ICONS = [
  "Monitor", "Lightbulb", "Volume2", "Layers", "Mic", "Sliders", 
  "Radio", "Tv", "Camera", "Wrench", "Zap", "Sparkles"
];

interface EquipmentCategoryItem {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
  items_count?: number;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
  status: string; // 'Available' or 'Booked'
  created_at?: string;
}

const emptyItem = {
  name: "",
  category: "Sound",
  description: "",
  image_url: "",
  status: "Available"
};

const emptyCat = {
  name: "",
  description: "",
  icon: "Wrench",
  order: 1
};

export function AdminEquipment() {
  // Data state
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<EquipmentCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Item form modal / drawer state
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Category management modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catForm, setCatForm] = useState<any>(null);
  const [editCatId, setEditCatId] = useState<string | null>(null);

  // Image Preview Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch all equipment and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from("equipment_categories")
        .select("*")
        .order("order");

      if (catError) {
        console.warn("Could not query equipment_categories:", catError);
      }

      // 2. Fetch Equipment
      const { data: eqData, error: eqError } = await supabase
        .from("equipment")
        .select("*")
        .order("name");

      if (eqError) throw eqError;

      const equipmentList = (eqData || []) as EquipmentItem[];
      setItems(equipmentList);

      // If categories from API exist, update items_count
      if (catData && catData.length > 0) {
        const computed = catData.map((c: any) => ({
          ...c,
          items_count: equipmentList.filter(e => e.category === c.name).length
        }));
        setCategories(computed);
      } else {
        // Fallback: derive categories from current equipment items or default 4
        const distinct = Array.from(new Set(equipmentList.map(e => e.category || "Audio"))).filter(Boolean);
        const fallbackCats: EquipmentCategoryItem[] = distinct.map((name, i) => {
          let icon = "Wrench";
          if (name === "Screens") icon = "Monitor";
          else if (name === "Lighting") icon = "Lightbulb";
          else if (name === "Sound") icon = "Volume2";
          else if (name === "Stages") icon = "Layers";

          return {
            name,
            icon,
            order: i + 1,
            description: `${name} event equipment.`,
            items_count: equipmentList.filter(e => e.category === name).length
          };
        });
        setCategories(fallbackCats);
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

  // Category names list for selects
  const categoryNames = useMemo(() => {
    const list = categories.map(c => c.name);
    return list.length > 0 ? list : ["Screens", "Lighting", "Sound", "Stages"];
  }, [categories]);

  // Filtered equipment list
  const filteredItems = useMemo(() => {
    return items.filter(eq => {
      const matchesSearch = !search.trim() || 
        eq.name?.toLowerCase().includes(search.toLowerCase()) || 
        eq.description?.toLowerCase().includes(search.toLowerCase()) ||
        eq.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || eq.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || eq.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  // -------------------------------------------------------------
  // SELECTION & BULK ACTIONS
  // -------------------------------------------------------------
  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(i => selectedIds.includes(i.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all currently filtered items
      const filteredIdSet = new Set(filteredItems.map(i => i.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      // Select all currently filtered items
      const newSelected = new Set([...selectedIds, ...filteredItems.map(i => i.id)]);
      setSelectedIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, i]
    );
  };

  // Bulk status update
  const handleBulkStatusChange = async (newStatus: "Available" | "Booked") => {
    if (selectedIds.length === 0) return;
    try {
      // Update each item in parallel
      const promises = selectedIds.map(id =>
        supabase.from("equipment").update({ status: newStatus }).eq("id", id)
      );
      await Promise.all(promises);
      toast({ 
        title: `Updated ${selectedIds.length} item(s)`,
        description: `Marked as ${newStatus}` 
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Bulk update failed", description: err.message, variant: "destructive" });
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected equipment item(s)?`)) return;

    try {
      const promises = selectedIds.map(id =>
        supabase.from("equipment").delete().eq("id", id)
      );
      await Promise.all(promises);
      toast({ title: `Deleted ${selectedIds.length} item(s)` });
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      toast({ title: "Bulk delete failed", description: err.message, variant: "destructive" });
    }
  };

  // -------------------------------------------------------------
  // SINGLE ITEM ACTIONS
  // -------------------------------------------------------------
  const toggleSingleStatus = async (id: string, current: string) => {
    const next = current === "Available" ? "Booked" : "Available";
    try {
      const { error } = await supabase.from("equipment").update({ status: next }).eq("id", id);
      if (error) throw error;
      toast({ 
        title: `Status updated`,
        description: `Marked as ${next}` 
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Status toggle failed", description: err.message, variant: "destructive" });
    }
  };

  const saveItem = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Equipment Name is required", variant: "destructive" });
      return;
    }
    const payload = { 
      name: form.name.trim(), 
      category: form.category || categoryNames[0] || "Sound", 
      description: form.description, 
      image_url: form.image_url, 
      status: form.status || "Available"
    };

    try {
      if (editId) {
        const { error } = await supabase.from("equipment").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Equipment updated successfully!" });
      } else {
        const { error } = await supabase.from("equipment").insert(payload);
        if (error) throw error;
        toast({ title: "Equipment item created successfully!" });
      }
      setForm(null);
      setEditId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const removeItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
      toast({ title: `"${name}" deleted` });
      setSelectedIds(prev => prev.filter(i => i !== id));
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // -------------------------------------------------------------
  // CATEGORIES CRUD
  // -------------------------------------------------------------
  const saveCategory = async () => {
    if (!catForm?.name?.trim()) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: catForm.name.trim(),
      description: catForm.description,
      icon: catForm.icon || "Wrench",
      order: Number(catForm.order) || 1
    };

    try {
      if (editCatId) {
        const { error } = await supabase.from("equipment_categories").update(payload).eq("id", editCatId);
        if (error) throw error;
        toast({ title: "Category updated!" });
      } else {
        const { error } = await supabase.from("equipment_categories").insert(payload);
        if (error) throw error;
        toast({ title: "Category added!" });
      }
      setCatForm(null);
      setEditCatId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Category save failed", description: err.message, variant: "destructive" });
    }
  };

  const deleteCategory = async (cat: EquipmentCategoryItem) => {
    const count = items.filter(e => e.category === cat.name).length;
    const confirmMsg = count > 0 
      ? `Are you sure you want to delete category "${cat.name}"? ${count} item(s) are currently under this category and will be reassigned to "Other".`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (cat.id) {
        const { error } = await supabase.from("equipment_categories").delete().eq("id", cat.id);
        if (error) throw error;
      }
      toast({ title: `Category "${cat.name}" deleted` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // -------------------------------------------------------------
  // EXPORT HANDLERS
  // -------------------------------------------------------------
  const handleExportExcel = () => {
    const exportData = filteredItems.map(eq => ({
      ID: eq.id,
      Name: eq.name,
      Category: eq.category,
      Status: eq.status,
      "Image URL": eq.image_url || "N/A",
      Description: eq.description || ""
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
    <div className="space-y-5">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-md">
        <div>
          <h2 className="font-extrabold text-foreground text-lg tracking-tight flex items-center gap-2">
            <span>Equipment Rentals</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
              {filteredItems.length} items
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your audio, lighting, video screens, and staging rental inventory
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCategoryModalOpen(true)} 
            className="h-9 gap-1.5 text-xs rounded-xl border-border/70 hover:bg-muted"
          >
            <FolderPlus className="h-3.5 w-3.5 text-secondary" />
            <span>Manage Categories ({categories.length})</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-9 gap-1.5 text-xs rounded-xl">
            <Download className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-9 gap-1.5 text-xs rounded-xl">
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>

          <Button 
            className="btn-gold h-9 gap-1.5 text-xs font-bold rounded-xl"
            onClick={() => { 
              setForm({ ...emptyItem, category: categoryNames[0] || "Sound" }); 
              setEditId(null); 
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search equipment by name, technical specs, category..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 h-10 rounded-xl bg-card border-border/60"
          />
        </div>

        {/* Category Filter Pills / Dropdown */}
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)} 
          className="h-10 px-3 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
        >
          <option value="All">All Categories ({items.length})</option>
          {categories.map(cat => {
            const count = items.filter(e => e.category === cat.name).length;
            return (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({count})
              </option>
            );
          })}
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="h-10 px-3 rounded-xl border border-border/60 bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available Only ({items.filter(i => i.status === "Available").length})</option>
          <option value="Booked">Booked Only ({items.filter(i => i.status === "Booked").length})</option>
        </select>
      </div>

      {/* ── Category Quick Filter Badges Strip ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
            categoryFilter === "All"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground hover:text-foreground border-border/60"
          }`}
        >
          All Items ({items.length})
        </button>

        {categories.map(cat => {
          const count = items.filter(e => e.category === cat.name).length;
          const isActive = categoryFilter === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setCategoryFilter(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? "bg-secondary text-secondary-foreground border-secondary font-bold shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground border-border/60"
              }`}
            >
              <DynamicIcon name={cat.icon} className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Floating / Sticky Bulk Actions Toolbar (when items selected) ── */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-600 text-white shadow-xl animate-scale-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-mono text-xs">
              {selectedIds.length}
            </span>
            <span>item(s) selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mark Available Button */}
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange("Available")}
              className="h-8 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Mark Available</span>
            </Button>

            {/* Mark Booked Button */}
            <Button
              size="sm"
              onClick={() => handleBulkStatusChange("Booked")}
              className="h-8 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-sm"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Mark Booked</span>
            </Button>

            {/* Bulk Delete Button */}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="h-8 text-xs font-bold rounded-xl gap-1.5 bg-red-700 hover:bg-red-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </Button>

            {/* Clear Selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="h-8 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Form Card (Add / Edit Equipment Item) ── */}
      {form && (
        <div className="card-premium p-6 rounded-2xl border border-secondary/40 bg-card shadow-xl space-y-4 animate-scale-in">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h3 className="font-extrabold text-foreground text-md flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                <Wrench className="h-4 w-4" />
              </span>
              <span>{editId ? "Edit" : "New"} Rental Equipment Item</span>
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setForm(null)}><X className="h-4 w-4" /></Button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-foreground font-bold">Equipment Name *</label>
              <Input 
                placeholder="e.g. Dual 18' Stage Subwoofers" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-foreground font-bold">Category *</label>
                <button 
                  type="button" 
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  + Add Category
                </button>
              </div>
              <select 
                className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-foreground font-bold">Availability Status *</label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "Available" })}
                  className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    form.status === "Available"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Available</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "Booked" })}
                  className={`h-9 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    form.status === "Booked"
                      ? "bg-red-500/15 border-red-500 text-red-600 dark:text-red-400 shadow-xs"
                      : "border-border/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Booked</span>
                </button>
              </div>
            </div>

            {/* Image URL & File Upload */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-foreground font-bold">Equipment Image</label>
              <div className="flex gap-2 items-center">
                <Input 
                  placeholder="https://... or /assets/..." 
                  value={form.image_url} 
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                  className="rounded-xl flex-1"
                />
                <FileUpload onUpload={(url) => setForm({ ...form, image_url: url })} label="Upload Image" />
              </div>

              {/* Live Image Preview */}
              {form.image_url && (
                <div className="mt-2.5 flex items-center gap-3 p-2 bg-muted/30 rounded-xl border border-border/50">
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-border/70 relative shrink-0">
                    <img 
                      src={resolveMediaUrl(form.image_url)} 
                      alt="Equipment Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-foreground">Preview Active</span>
                    <p className="text-[11px] text-muted-foreground truncate max-w-sm">{form.image_url}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-foreground font-bold">Technical Specifications / Description</label>
              <Textarea 
                placeholder="Power output, dimensions, channel count, manufacturer specifications..." 
                rows={3} 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button className="btn-gold font-bold text-xs" onClick={saveItem}>Save Item</Button>
            <Button variant="outline" className="text-xs" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Equipment Table (Desktop) ── */}
      <div className="hidden md:block border border-border/60 rounded-2xl overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="p-3.5 w-10">
                  <Checkbox 
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-3.5 font-bold text-muted-foreground w-20">Image</th>
                <th className="p-3.5 font-bold text-muted-foreground">Item details</th>
                <th className="p-3.5 font-bold text-muted-foreground w-36">Category</th>
                <th className="p-3.5 font-bold text-muted-foreground w-40 text-center">Status (Click to toggle)</th>
                <th className="p-3.5 font-bold text-muted-foreground text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredItems.map(eq => {
                const isSelected = selectedIds.includes(eq.id);
                const isAvailable = eq.status === "Available";

                return (
                  <tr 
                    key={eq.id} 
                    className={`hover:bg-muted/20 transition-colors ${isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOne(eq.id)}
                        aria-label={`Select ${eq.name}`}
                      />
                    </td>

                    {/* Image Thumbnail */}
                    <td className="p-3.5">
                      <div 
                        onClick={() => eq.image_url && setPreviewImage(resolveMediaUrl(eq.image_url))}
                        className={`w-14 h-11 rounded-lg overflow-hidden border border-border/70 relative shrink-0 bg-muted/40 flex items-center justify-center group ${
                          eq.image_url ? "cursor-pointer hover:border-secondary" : ""
                        }`}
                        title={eq.image_url ? "Click to view full image" : "No image"}
                      >
                        {eq.image_url ? (
                          <>
                            <img 
                              src={resolveMediaUrl(eq.image_url)} 
                              alt={eq.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-3.5 w-3.5 text-white" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>

                    {/* Item Details */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-foreground">{eq.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                        {eq.description || "No specifications added."}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-muted/60 text-foreground border border-border/50 rounded-lg">
                        <DynamicIcon name={categories.find(c => c.name === eq.category)?.icon} className="h-3.5 w-3.5 text-secondary" />
                        <span>{eq.category}</span>
                      </span>
                    </td>

                    {/* Status with Direct One-Click Toggle */}
                    <td className="p-3.5 text-center">
                      <button 
                        type="button"
                        onClick={() => toggleSingleStatus(eq.id, eq.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-xs ${
                          isAvailable
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25"
                        }`}
                        title={`Click to mark as ${isAvailable ? "Booked" : "Available"}`}
                      >
                        {isAvailable ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                        <span>{eq.status}</span>
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg" 
                          title="Edit Equipment"
                          onClick={() => { setForm(eq); setEditId(eq.id); }}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="Delete Equipment"
                          onClick={() => removeItem(eq.id, eq.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground text-sm">
                    No equipment found matching your criteria. Try adjusting filters or click &quot;Add Item&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Equipment Cards (Mobile View) ── */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredItems.map(eq => {
          const isSelected = selectedIds.includes(eq.id);
          const isAvailable = eq.status === "Available";

          return (
            <div 
              key={eq.id} 
              className={`card-premium p-4 rounded-xl border border-border/60 space-y-3 ${
                isSelected ? "border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => toggleSelectOne(eq.id)}
                  aria-label={`Select ${eq.name}`}
                  className="mt-1"
                />

                {/* Thumbnail */}
                <div 
                  onClick={() => eq.image_url && setPreviewImage(resolveMediaUrl(eq.image_url))}
                  className="w-16 h-14 rounded-lg overflow-hidden border border-border/70 relative shrink-0 bg-muted/40 flex items-center justify-center"
                >
                  {eq.image_url ? (
                    <img src={resolveMediaUrl(eq.image_url)} alt={eq.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-foreground text-sm truncate">{eq.name}</h4>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {eq.description || "No description."}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-muted rounded border border-border/40">
                      {eq.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Toggle & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <button 
                  type="button"
                  onClick={() => toggleSingleStatus(eq.id, eq.status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                  }`}
                >
                  {isAvailable ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                  <span>{eq.status}</span>
                </button>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm(eq); setEditId(eq.id); }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(eq.id, eq.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Category Management Modal (Dialog) ── */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-secondary" />
              <span>Equipment Categories Manager</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add new categories, edit names or icons, and manage existing inventory categories.
            </DialogDescription>
          </DialogHeader>

          {/* Category Add/Edit Sub-form */}
          {catForm ? (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3 animate-scale-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  {editCatId ? `Edit Category: ${catForm.name}` : "Create New Category"}
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setCatForm(null)} className="h-6 w-6 p-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Category Name *</label>
                  <Input 
                    placeholder="e.g. Visual & Projection"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">Display Order</label>
                  <Input 
                    type="number"
                    placeholder="1"
                    value={catForm.order}
                    onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value) || 1 })}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-foreground">Description</label>
                  <Input 
                    placeholder="Brief description of gear in this category..."
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-foreground">Category Icon</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-card rounded-lg border border-border/50 max-h-20 overflow-y-auto">
                    {POPULAR_CAT_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setCatForm({ ...catForm, icon: ic })}
                        className={`p-1.5 rounded-md border text-xs flex items-center gap-1 ${
                          catForm.icon === ic
                            ? "bg-secondary text-secondary-foreground border-secondary font-bold"
                            : "border-border/40 hover:bg-muted"
                        }`}
                      >
                        <DynamicIcon name={ic} className="h-3.5 w-3.5" />
                        <span className="text-[10px]">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="btn-gold h-7 text-xs font-bold" onClick={saveCategory}>
                  Save Category
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCatForm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={() => {
                  setCatForm({ ...emptyCat, order: categories.length + 1 });
                  setEditCatId(null);
                }}
                className="h-8 text-xs font-bold rounded-xl btn-gold gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Category
              </Button>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2 mt-2">
            {categories.map((c, idx) => {
              const count = items.filter(e => e.category === c.name).length;

              return (
                <div 
                  key={c.id || c.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 hover:border-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0">
                      <DynamicIcon name={c.icon} className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-foreground text-xs flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-muted text-muted-foreground border border-border/40">
                          {count} item{count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{c.description || "No description."}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg"
                      onClick={() => {
                        setEditCatId(c.id || null);
                        setCatForm({
                          name: c.name,
                          description: c.description || "",
                          icon: c.icon || "Wrench",
                          order: c.order || idx + 1
                        });
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCategory(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Image Lightbox Modal ── */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-2 rounded-2xl bg-black/90 border-white/20">
          <div className="relative overflow-hidden rounded-xl">
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Full preview" 
                className="w-full h-auto max-h-[80vh] object-contain mx-auto" 
              />
            )}
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}