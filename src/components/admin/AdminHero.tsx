import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  Save, Sparkles, Plus, Trash2, Edit2, Check, X,
  Image as ImageIcon, Layers, Link as LinkIcon, Eye,
  RefreshCw, MoveUp, MoveDown
} from "lucide-react";

interface CtaButton {
  id: string;
  label: string;
  url: string;
  style: "primary" | "secondary" | "outline";
  icon?: string;
}

export function AdminHero() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "media" | "cta" | "photos">("text");

  // Hero fields
  const [heroId, setHeroId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    headline_prefix: "Creating",
    headline_highlight: "Unforgettable",
    headline_suffix: "Experiences",
    subtitle_prefix: "with",
    subtitle_brand: "Kundwa",
    description: "Creating unforgettable experiences with world-class sound, lighting, and stage production.",
    background_image: "/14.jpg",
  });

  // Dynamic glitch words
  const [glitchWords, setGlitchWords] = useState<string[]>(["Sound", "Events", "IB Group"]);
  const [newGlitchWord, setNewGlitchWord] = useState("");

  // CTA buttons
  const [ctaButtons, setCtaButtons] = useState<CtaButton[]>([
    { id: "1", label: "Book a Service", url: "/services", style: "primary", icon: "calendar" },
    { id: "2", label: "Buy Ticket", url: "/events", style: "secondary", icon: "ticket" },
    { id: "3", label: "Rent Equipment", url: "/rentals", style: "outline", icon: "wrench" },
  ]);
  const [editingCta, setEditingCta] = useState<CtaButton | null>(null);
  const [newCta, setNewCta] = useState<CtaButton>({
    id: "",
    label: "",
    url: "",
    style: "primary",
    icon: "calendar",
  });
  const [showAddCta, setShowAddCta] = useState(false);

  // Carousel photos
  const [carouselPhotos, setCarouselPhotos] = useState<string[]>([
    "/photos/12.jpg", "/photos/13.jpg", "/photos/14.jpg",
    "/photos/gosheni_Choir_15.jpg", "/photos/gosheni_Choir_16.jpg",
    "/photos/ichthus_01.jpg", "/photos/ichthus_02.jpg", "/photos/ichthus_03.jpg",
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("hero_settings").select("*").single();
      if (data) {
        setHeroId(data.id);
        setFormData({
          headline_prefix: data.headline_prefix || "Creating",
          headline_highlight: data.headline_highlight || "Unforgettable",
          headline_suffix: data.headline_suffix || "Experiences",
          subtitle_prefix: data.subtitle_prefix || "with",
          subtitle_brand: data.subtitle_brand || "Kundwa",
          description: data.description || "Creating unforgettable experiences with world-class sound, lighting, and stage production.",
          background_image: data.background_image || "/14.jpg",
        });

        if (Array.isArray(data.glitch_words) && data.glitch_words.length > 0) {
          setGlitchWords(data.glitch_words);
        }
        if (Array.isArray(data.cta_buttons) && data.cta_buttons.length > 0) {
          setCtaButtons(data.cta_buttons);
        }
        if (Array.isArray(data.carousel_photos) && data.carousel_photos.length > 0) {
          setCarouselPhotos(data.carousel_photos);
        }
      }
    } catch (err: any) {
      console.error("Failed to load hero settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        glitch_words: glitchWords,
        cta_buttons: ctaButtons,
        carousel_photos: carouselPhotos,
        updated_at: new Date().toISOString(),
      };

      let res;
      if (heroId) {
        res = await supabase.from("hero_settings").update(payload).eq("id", heroId);
      } else {
        res = await supabase.from("hero_settings").insert(payload);
      }

      if (res.error) throw res.error;
      toast({ title: "Hero section saved successfully!", description: "Live website has been updated." });
    } catch (err: any) {
      toast({ title: "Error saving hero settings", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Glitch words helpers
  const addGlitchWord = () => {
    if (!newGlitchWord.trim()) return;
    if (!glitchWords.includes(newGlitchWord.trim())) {
      setGlitchWords([...glitchWords, newGlitchWord.trim()]);
    }
    setNewGlitchWord("");
  };

  const removeGlitchWord = (index: number) => {
    setGlitchWords(glitchWords.filter((_, i) => i !== index));
  };

  // CTA helpers
  const handleAddCta = () => {
    if (!newCta.label || !newCta.url) {
      toast({ title: "Please provide a label and URL", variant: "destructive" });
      return;
    }
    setCtaButtons([...ctaButtons, { ...newCta, id: Date.now().toString() }]);
    setNewCta({ id: "", label: "", url: "", style: "primary", icon: "calendar" });
    setShowAddCta(false);
  };

  const handleUpdateCta = () => {
    if (!editingCta) return;
    setCtaButtons(ctaButtons.map((btn) => (btn.id === editingCta.id ? editingCta : btn)));
    setEditingCta(null);
  };

  const handleDeleteCta = (id: string) => {
    setCtaButtons(ctaButtons.filter((btn) => btn.id !== id));
  };

  // Photo helpers
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setCarouselPhotos([...carouselPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  const handleDeletePhoto = (index: number) => {
    setCarouselPhotos(carouselPhotos.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= carouselPhotos.length) return;
    const updated = [...carouselPhotos];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCarouselPhotos(updated);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Loading Hero Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Hero Section Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize headlines, animated text, background media, CTA buttons, and 3D rotating carousel photos.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save All Changes"}</span>
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/60">
        {[
          { id: "text", label: "Headlines & Text", icon: Layers },
          { id: "media", label: "Background Media", icon: ImageIcon },
          { id: "cta", label: "CTA Buttons", icon: LinkIcon },
          { id: "photos", label: "3D Carousel Photos", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Headlines & Text ── */}
      {activeTab === "text" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Main Typography</h3>
            <p className="text-xs text-muted-foreground">The main focal headline displayed in the hero section</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Headline Prefix</label>
              <Input
                value={formData.headline_prefix}
                onChange={(e) => setFormData({ ...formData, headline_prefix: e.target.value })}
                placeholder="e.g. Creating"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-600 block mb-1">Highlight Word (Cyan)</label>
              <Input
                value={formData.headline_highlight}
                onChange={(e) => setFormData({ ...formData, headline_highlight: e.target.value })}
                placeholder="e.g. Unforgettable"
                className="h-10 text-xs font-bold text-blue-600 border-blue-500/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Headline Suffix</label>
              <Input
                value={formData.headline_suffix}
                onChange={(e) => setFormData({ ...formData, headline_suffix: e.target.value })}
                placeholder="e.g. Experiences"
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Subtitle with Glitch Effect */}
          <div className="pt-4 border-t border-border/60 space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                Animated Glitch Text Subtitle
              </h3>
              <p className="text-xs text-muted-foreground">
                Words that rotate with glitch animation (e.g. "with Kundwa [Sound / Events / IB Group]")
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Subtitle Prefix</label>
                <Input
                  value={formData.subtitle_prefix}
                  onChange={(e) => setFormData({ ...formData, subtitle_prefix: e.target.value })}
                  placeholder="e.g. with"
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Brand Name</label>
                <Input
                  value={formData.subtitle_brand}
                  onChange={(e) => setFormData({ ...formData, subtitle_brand: e.target.value })}
                  placeholder="e.g. Kundwa"
                  className="h-10 text-xs font-bold"
                />
              </div>
            </div>

            {/* Glitch words list */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">Glitch Rotating Words</label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {glitchWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => removeGlitchWord(idx)}
                      className="hover:text-destructive transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  value={newGlitchWord}
                  onChange={(e) => setNewGlitchWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGlitchWord())}
                  placeholder="Add rotating word..."
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  onClick={addGlitchWord}
                  size="sm"
                  className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Description Paragraph */}
          <div className="pt-4 border-t border-border/60">
            <label className="text-xs font-bold text-foreground block mb-1">Hero Description</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter hero intro description..."
              className="text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* ── Tab 2: Background Media ── */}
      {activeTab === "media" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Cinematic Background</h3>
            <p className="text-xs text-muted-foreground">The full-screen background image or video banner</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Background Image URL</label>
              <div className="flex gap-2 items-center">
                <Input
                  value={formData.background_image}
                  onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                  placeholder="/14.jpg or https://..."
                  className="h-10 text-xs"
                />
                <FileUpload
                  onUpload={(url) => setFormData({ ...formData, background_image: url })}
                  label="Upload Media"
                />
              </div>
            </div>

            {/* Live Preview Thumbnail */}
            {formData.background_image && (
              <div className="relative aspect-video max-w-xl rounded-2xl overflow-hidden border border-border/80 shadow-md">
                <img
                  src={formData.background_image}
                  alt="Hero Background Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold">Current Hero Background Preview</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: CTA Buttons (Full CRUD) ── */}
      {activeTab === "cta" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Action Buttons (CTAs)</h3>
              <p className="text-xs text-muted-foreground">Buttons rendered under the main headline</p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddCta(!showAddCta)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-8 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddCta ? "Cancel" : "Add New Button"}</span>
            </Button>
          </div>

          {/* Add CTA Form */}
          {showAddCta && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] space-y-3">
              <h4 className="font-bold text-xs text-foreground">Add New CTA Button</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Button Label (e.g. Book a Service)"
                  value={newCta.label}
                  onChange={(e) => setNewCta({ ...newCta, label: e.target.value })}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="URL Destination (e.g. /services)"
                  value={newCta.url}
                  onChange={(e) => setNewCta({ ...newCta, url: e.target.value })}
                  className="h-9 text-xs"
                />
                <select
                  value={newCta.style}
                  onChange={(e) => setNewCta({ ...newCta, style: e.target.value as any })}
                  className="h-9 px-3 rounded-xl border border-border text-xs bg-background text-foreground"
                >
                  <option value="primary">Primary (Cyan Gold)</option>
                  <option value="secondary">Secondary (White Glass)</option>
                  <option value="outline">Outline (Subtle)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" onClick={() => setShowAddCta(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddCta} className="h-8 text-xs bg-blue-600 text-white font-bold">
                  Save Button
                </Button>
              </div>
            </div>
          )}

          {/* List of CTA buttons */}
          <div className="space-y-3">
            {ctaButtons.map((btn) => (
              <div
                key={btn.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20"
              >
                {editingCta?.id === btn.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 mr-3">
                    <Input
                      value={editingCta.label}
                      onChange={(e) => setEditingCta({ ...editingCta, label: e.target.value })}
                      className="h-8 text-xs font-bold"
                    />
                    <Input
                      value={editingCta.url}
                      onChange={(e) => setEditingCta({ ...editingCta, url: e.target.value })}
                      className="h-8 text-xs"
                    />
                    <select
                      value={editingCta.style}
                      onChange={(e) => setEditingCta({ ...editingCta, style: e.target.value as any })}
                      className="h-8 px-2 rounded-lg border text-xs bg-background"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="outline">Outline</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-xs text-foreground">{btn.label}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{btn.url}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">
                      {btn.style}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {editingCta?.id === btn.id ? (
                    <>
                      <Button size="sm" onClick={handleUpdateCta} className="h-7 px-2 text-xs bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCta(null)} className="h-7 px-2 text-xs">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCta(btn)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCta(btn.id)}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 4: 3D Carousel Photos Gallery (Full CRUD) ── */}
      {activeTab === "photos" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-3">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                3D Rotating Carousel Photos
              </h3>
              <p className="text-xs text-muted-foreground">
                These photos rotate in the 3D perspective stage cards on the right side of the hero section ({carouselPhotos.length} photos)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FileUpload
                onUpload={(url) => setCarouselPhotos([...carouselPhotos, url])}
                label="Upload Photo"
              />
            </div>
          </div>

          {/* Quick Add photo by URL */}
          <div className="flex gap-2 max-w-lg">
            <Input
              placeholder="Paste image URL (e.g. /photos/12.jpg or https://...)"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPhoto())}
              className="h-9 text-xs"
            />
            <Button
              type="button"
              onClick={handleAddPhoto}
              size="sm"
              className="h-9 px-3.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Photo
            </Button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {carouselPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border/70 bg-muted/30 shadow-xs flex flex-col justify-between"
              >
                <img
                  src={photo}
                  alt={`Hero slide ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge Number */}
                <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </div>

                {/* Overlay controls on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(idx, "up")}
                    disabled={idx === 0}
                    title="Move earlier"
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 transition-colors"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(idx, "down")}
                    disabled={idx === carouselPhotos.length - 1}
                    title="Move later"
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 transition-colors"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(idx)}
                    title="Delete photo"
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
