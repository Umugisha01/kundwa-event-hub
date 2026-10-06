import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Save, Plus, Trash2, Edit2, Check, X,
  Link as LinkIcon, Settings, Phone, Mail, MapPin,
  Share2, Shield, Wrench
} from "lucide-react";

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

interface FooterServiceItem {
  id: string;
  label: string;
  url?: string;
}

export function AdminFooter() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "social" | "links" | "services">("general");

  const [footerId, setFooterId] = useState<string | null>(null);
  const [generalForm, setGeneralForm] = useState({
    tagline: "Creating unforgettable experiences with world-class sound, lighting, and stage production.",
    contact_email: "info@kundwaib.com",
    contact_phone: "+250 788 000 000",
    contact_address: "Kigali, Rwanda",
    copyright_text: `© ${new Date().getFullYear()} Kundwa IB Group. All rights reserved.`,
  });

  const [socialForm, setSocialForm] = useState({
    facebook_url: "https://facebook.com/kundwaib",
    instagram_url: "https://instagram.com/kundwaib",
    twitter_url: "https://twitter.com/kundwaib",
    youtube_url: "https://youtube.com/kundwaib",
  });

  // Quick Links (Full CRUD)
  const [quickLinks, setQuickLinks] = useState<FooterLink[]>([
    { id: "1", label: "Home", url: "/" },
    { id: "2", label: "Services", url: "/services" },
    { id: "3", label: "Rentals", url: "/rentals" },
    { id: "4", label: "Events", url: "/events" },
    { id: "5", label: "Contact", url: "/contact" },
  ]);
  const [newQuickLink, setNewQuickLink] = useState({ label: "", url: "" });
  const [editingQuickLink, setEditingQuickLink] = useState<FooterLink | null>(null);
  const [showAddLink, setShowAddLink] = useState(false);

  // Services List (Full CRUD)
  const [servicesList, setServicesList] = useState<FooterServiceItem[]>([
    { id: "1", label: "Sound Systems", url: "/services" },
    { id: "2", label: "Lighting Design", url: "/services" },
    { id: "3", label: "Stage Production", url: "/services" },
    { id: "4", label: "Event Management", url: "/services" },
  ]);
  const [newServiceItem, setNewServiceItem] = useState({ label: "", url: "/services" });
  const [editingServiceItem, setEditingServiceItem] = useState<FooterServiceItem | null>(null);
  const [showAddService, setShowAddService] = useState(false);

  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("footer_settings").select("*").single();
      if (data) {
        setFooterId(data.id);
        setGeneralForm({
          tagline: data.tagline || "Creating unforgettable experiences with world-class sound, lighting, and stage production.",
          contact_email: data.contact_email || "info@kundwaib.com",
          contact_phone: data.contact_phone || "+250 788 000 000",
          contact_address: data.contact_address || "Kigali, Rwanda",
          copyright_text: data.copyright_text || `© ${new Date().getFullYear()} Kundwa IB Group. All rights reserved.`,
        });

        setSocialForm({
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          twitter_url: data.twitter_url || "",
          youtube_url: data.youtube_url || "",
        });

        if (Array.isArray(data.quick_links) && data.quick_links.length > 0) {
          setQuickLinks(data.quick_links);
        }
        if (Array.isArray(data.services_list) && data.services_list.length > 0) {
          setServicesList(data.services_list);
        }
      }
    } catch (err: any) {
      console.error("Failed to load footer settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...generalForm,
        ...socialForm,
        quick_links: quickLinks,
        services_list: servicesList,
        updated_at: new Date().toISOString(),
      };

      let res;
      if (footerId) {
        res = await supabase.from("footer_settings").update(payload).eq("id", footerId);
      } else {
        res = await supabase.from("footer_settings").insert(payload);
      }

      if (res.error) throw res.error;
      toast({ title: "Footer updated successfully!", description: "Live website footer is now updated." });
    } catch (err: any) {
      toast({ title: "Error saving footer", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Quick Links CRUD
  const handleAddLink = () => {
    if (!newQuickLink.label.trim() || !newQuickLink.url.trim()) {
      toast({ title: "Please fill in link title and destination", variant: "destructive" });
      return;
    }
    setQuickLinks([...quickLinks, { id: Date.now().toString(), ...newQuickLink }]);
    setNewQuickLink({ label: "", url: "" });
    setShowAddLink(false);
  };

  const handleUpdateLink = () => {
    if (!editingQuickLink) return;
    setQuickLinks(quickLinks.map((l) => (l.id === editingQuickLink.id ? editingQuickLink : l)));
    setEditingQuickLink(null);
  };

  const handleDeleteLink = (id: string) => {
    setQuickLinks(quickLinks.filter((l) => l.id !== id));
  };

  // Services CRUD
  const handleAddService = () => {
    if (!newServiceItem.label.trim()) {
      toast({ title: "Please provide a service title", variant: "destructive" });
      return;
    }
    setServicesList([...servicesList, { id: Date.now().toString(), ...newServiceItem }]);
    setNewServiceItem({ label: "", url: "/services" });
    setShowAddService(false);
  };

  const handleUpdateService = () => {
    if (!editingServiceItem) return;
    setServicesList(servicesList.map((s) => (s.id === editingServiceItem.id ? editingServiceItem : s)));
    setEditingServiceItem(null);
  };

  const handleDeleteService = (id: string) => {
    setServicesList(servicesList.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Loading Footer Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Footer Settings & Links Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full control over company branding, contact details, quick navigation links, services directory, and social profiles.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Footer"}</span>
        </Button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/60">
        {[
          { id: "general", label: "Contact & Company Info", icon: Settings },
          { id: "links", label: `Quick Links (${quickLinks.length})`, icon: LinkIcon },
          { id: "services", label: `Services Directory (${servicesList.length})`, icon: Wrench },
          { id: "social", label: "Social Media URLs", icon: Share2 },
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

      {/* ── Tab 1: Contact & Company Info ── */}
      {activeTab === "general" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Company Brand & Contact</h3>
            <p className="text-xs text-muted-foreground">General information shown in the left column and contact block of the footer</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Company Tagline / Intro</label>
              <Textarea
                rows={2}
                value={generalForm.tagline}
                onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                placeholder="Tagline shown below the logo..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Contact Email</span>
                </label>
                <Input
                  value={generalForm.contact_email}
                  onChange={(e) => setGeneralForm({ ...generalForm, contact_email: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Contact Phone</span>
                </label>
                <Input
                  value={generalForm.contact_phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, contact_phone: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Physical Address / Location</span>
                </label>
                <Input
                  value={generalForm.contact_address}
                  onChange={(e) => setGeneralForm({ ...generalForm, contact_address: e.target.value })}
                  className="h-10 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copyright Notice</span>
                </label>
                <Input
                  value={generalForm.copyright_text}
                  onChange={(e) => setGeneralForm({ ...generalForm, copyright_text: e.target.value })}
                  className="h-10 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Quick Links (Full CRUD) ── */}
      {activeTab === "links" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Quick Links Column</h3>
              <p className="text-xs text-muted-foreground">Add, edit, or delete navigation links rendered in the Quick Links column</p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddLink(!showAddLink)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-8 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddLink ? "Cancel" : "Add Link"}</span>
            </Button>
          </div>

          {/* Add Link Form */}
          {showAddLink && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] space-y-3">
              <h4 className="font-bold text-xs text-foreground">Add New Quick Link</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Link Title (e.g. Portfolio)"
                  value={newQuickLink.label}
                  onChange={(e) => setNewQuickLink({ ...newQuickLink, label: e.target.value })}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="Destination URL (e.g. /portfolio or https://...)"
                  value={newQuickLink.url}
                  onChange={(e) => setNewQuickLink({ ...newQuickLink, url: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" onClick={() => setShowAddLink(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddLink} className="h-8 text-xs bg-blue-600 text-white font-bold">
                  Save Link
                </Button>
              </div>
            </div>
          )}

          {/* Links List */}
          <div className="space-y-2.5">
            {quickLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20"
              >
                {editingQuickLink?.id === link.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 mr-3">
                    <Input
                      value={editingQuickLink.label}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, label: e.target.value })}
                      className="h-8 text-xs font-bold"
                    />
                    <Input
                      value={editingQuickLink.url}
                      onChange={(e) => setEditingQuickLink({ ...editingQuickLink, url: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-foreground">{link.label}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{link.url}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {editingQuickLink?.id === link.id ? (
                    <>
                      <Button size="sm" onClick={handleUpdateLink} className="h-7 px-2 text-xs bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingQuickLink(null)} className="h-7 px-2 text-xs">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingQuickLink(link)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLink(link.id)}
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

      {/* ── Tab 3: Services Directory (Full CRUD) ── */}
      {activeTab === "services" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Services Column</h3>
              <p className="text-xs text-muted-foreground">List of services displayed in the Services footer column</p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddService(!showAddService)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-8 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddService ? "Cancel" : "Add Service"}</span>
            </Button>
          </div>

          {/* Add Service Form */}
          {showAddService && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.04] space-y-3">
              <h4 className="font-bold text-xs text-foreground">Add New Footer Service</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Service Name (e.g. Drone Light Shows)"
                  value={newServiceItem.label}
                  onChange={(e) => setNewServiceItem({ ...newServiceItem, label: e.target.value })}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="Target URL (e.g. /services)"
                  value={newServiceItem.url}
                  onChange={(e) => setNewServiceItem({ ...newServiceItem, url: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="ghost" onClick={() => setShowAddService(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddService} className="h-8 text-xs bg-blue-600 text-white font-bold">
                  Save Service
                </Button>
              </div>
            </div>
          )}

          {/* Services List */}
          <div className="space-y-2.5">
            {servicesList.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20"
              >
                {editingServiceItem?.id === service.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 mr-3">
                    <Input
                      value={editingServiceItem.label}
                      onChange={(e) => setEditingServiceItem({ ...editingServiceItem, label: e.target.value })}
                      className="h-8 text-xs font-bold"
                    />
                    <Input
                      value={editingServiceItem.url || "/services"}
                      onChange={(e) => setEditingServiceItem({ ...editingServiceItem, url: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-foreground">{service.label}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{service.url || "/services"}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  {editingServiceItem?.id === service.id ? (
                    <>
                      <Button size="sm" onClick={handleUpdateService} className="h-7 px-2 text-xs bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingServiceItem(null)} className="h-7 px-2 text-xs">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingServiceItem(service)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteService(service.id)}
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

      {/* ── Tab 4: Social Media URLs ── */}
      {activeTab === "social" && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Social Channels</h3>
            <p className="text-xs text-muted-foreground">Direct URLs to your verified social media pages</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Facebook URL</label>
              <Input
                value={socialForm.facebook_url}
                onChange={(e) => setSocialForm({ ...socialForm, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Instagram URL</label>
              <Input
                value={socialForm.instagram_url}
                onChange={(e) => setSocialForm({ ...socialForm, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Twitter / X URL</label>
              <Input
                value={socialForm.twitter_url}
                onChange={(e) => setSocialForm({ ...socialForm, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">YouTube URL</label>
              <Input
                value={socialForm.youtube_url}
                onChange={(e) => setSocialForm({ ...socialForm, youtube_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="h-10 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}