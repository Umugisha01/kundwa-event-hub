import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Calendar, Wrench, MessageSquare, Settings,
  Star, Image, LogOut, Ticket, FileText, Briefcase, Mail,
  Search, Bell, Sun, Moon, ExternalLink, Menu, X, Plus,
  ShieldCheck, Layers, LayoutDashboard, Sparkles
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminPortfolio } from "@/components/admin/AdminPortfolio";
import { AdminEquipment } from "@/components/admin/AdminEquipment";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminContacts } from "@/components/admin/AdminContacts";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminBrands } from "@/components/admin/AdminBrands";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminHero } from "@/components/admin/AdminHero";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  shortcut?: string;
  description: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "ANALYTICS",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘D", description: "Executive overview & live metrics" },
      { id: "bookings", label: "Bookings", icon: Ticket, shortcut: "⌘B", description: "Customer reservations & tickets" },
      { id: "stats", label: "Site Statistics", icon: BarChart3, shortcut: "⌘S", description: "Public counter configurations" },
    ],
  },
  {
    group: "DATA",
    items: [
      { id: "events", label: "Events", icon: Calendar, shortcut: "⌘E", description: "Upcoming festivals & concerts" },
      { id: "services", label: "Services", icon: FileText, shortcut: "⌘S", description: "Production packages & tiers" },
      { id: "portfolio", label: "Portfolio", icon: Briefcase, shortcut: "⌘P", description: "Past project showcases" },
      { id: "equipment", label: "Rentals", icon: Wrench, shortcut: "⌘R", description: "Rental equipment inventory" },
    ],
  },
  {
    group: "ENGAGEMENT",
    items: [
      { id: "contacts", label: "Contacts", icon: Mail, shortcut: "⌘C", description: "Client inquiries & messages" },
      { id: "testimonials", label: "Testimonials", icon: Star, description: "Customer reviews & feedback" },
      { id: "brands", label: "Brands", icon: Image, description: "Corporate sponsors & partners" },
    ],
  },
  {
    group: "OTHERS",
    items: [
      { id: "hero", label: "Hero Section", icon: Sparkles, shortcut: "⌘H", description: "Homepage headlines, carousel & CTA" },
      { id: "footer", label: "Footer", icon: Settings, shortcut: "⌘F", description: "Contact info, address & links" },
    ],
  },
];

const allTabs = navGroups.flatMap((g) => g.items);

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const currentTab = allTabs.find((t) => t.id === activeTab) || allTabs[0];

  // Optional keyboard shortcuts (⌘D, ⌘E, ⌘B, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        const key = e.key.toLowerCase();
        const matched = allTabs.find(
          (t) => t.shortcut && t.shortcut.toLowerCase().endsWith(key)
        );
        if (matched) {
          e.preventDefault();
          setActiveTab(matched.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter nav items if search is entered
  const filterGroup = (items: NavItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Admin";
  const displayEmail = profile?.email || user?.email || "admin@kundwa.rw";
  const userInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* ── Left Sidebar (Matching Template Layout) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-border/70 bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-0 lg:translate-x-0"
        } ${!sidebarOpen ? "-translate-x-full lg:translate-x-0" : ""}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border/60 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Template-style isometric block logo icon */}
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-foreground group-hover:text-blue-600 transition-colors">
                Kundwa Hub
              </span>
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                ADMIN PORTAL
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links (Categorized) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => {
            const filteredItems = filterGroup(group.items);
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-muted-foreground/70 uppercase">
                  {group.group}
                </div>

                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-slate-200/70 dark:bg-slate-800 text-foreground font-bold shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.shortcut && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded tracking-tighter ${
                              isActive
                                ? "bg-background/80 text-foreground/80 shadow-2xs"
                                : "text-muted-foreground/60"
                            }`}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Profile Card (Bottom of Sidebar) */}
        <div className="p-3 border-t border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-foreground truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate leading-tight">
                  {displayEmail}
                </span>
              </div>
            </div>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Body (Header + Content Canvas) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header matching Template */}
        <header className="h-16 px-4 md:px-8 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border/60 text-muted-foreground hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg md:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>{currentTab.label}</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border/40">
                  {currentTab.description}
                </span>
              </h1>
            </div>
          </div>

          {/* Right Header Tools matching Template: Search, Bell, Theme, Live Site button */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Input */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl bg-muted/40 border-border/60 focus:bg-background"
              />
            </div>

            {/* Notification Bell with Badge matching template */}
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-border/60"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  2
                </span>
              </button>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors border border-border/60"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* View Live Site Link */}
            <Link to="/" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex items-center gap-1.5 text-xs font-bold rounded-xl h-9 border-border/70"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Site</span>
              </Button>
            </Link>

            {/* Primary Action Button matching Template (+ Add New) */}
            <Button
              size="sm"
              onClick={() => {
                // If on events, services, portfolio, or equipment, triggers active tab focus
                const eventBtn = document.querySelector('[data-admin-create="true"]') as HTMLButtonElement;
                if (eventBtn) eventBtn.click();
              }}
              className="h-9 px-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area: Renders the exact admin components unchanged */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/15">
          <div className="max-w-7xl mx-auto">
            {/* The individual admin pages remain 100% functional and unchanged */}
            <div className="animate-fade-in">
              {activeTab === "dashboard" && <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
              {activeTab === "stats" && <AdminStats />}
              {activeTab === "events" && <AdminEvents />}
              {activeTab === "services" && <AdminServices />}
              {activeTab === "portfolio" && <AdminPortfolio />}
              {activeTab === "equipment" && <AdminEquipment />}
              {activeTab === "bookings" && <AdminBookings />}
              {activeTab === "contacts" && <AdminContacts />}
              {activeTab === "testimonials" && <AdminTestimonials />}
              {activeTab === "brands" && <AdminBrands />}
              {activeTab === "hero" && <AdminHero />}
              {activeTab === "footer" && <AdminFooter />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;