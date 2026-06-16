import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Calendar, Wrench, MessageSquare, Users, Settings,
  Star, Image, LogOut, Ticket, FileText, Briefcase, Mail
} from "lucide-react";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminPortfolio } from "@/components/admin/AdminPortfolio";
import { AdminEquipment } from "@/components/admin/AdminEquipment";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminContacts } from "@/components/admin/AdminContacts";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminBrands } from "@/components/admin/AdminBrands";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminChat } from "@/components/admin/AdminChat";
import { AdminFooter } from "@/components/admin/AdminFooter";

const tabs = [
  { id: "stats", label: "Statistics", icon: BarChart3 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "services", label: "Services", icon: FileText },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
  { id: "equipment", label: "Rentals", icon: Wrench },
  { id: "bookings", label: "Bookings", icon: Ticket },
  { id: "contacts", label: "Contacts", icon: Mail },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "brands", label: "Brands", icon: Image },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "footer", label: "Footer", icon: Settings },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const { signOut } = useAuth();

  return (
    <Layout>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your platform content</p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-1.5 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab content */}
          <div className="animate-fade-in">
            {activeTab === "stats" && <AdminStats />}
            {activeTab === "events" && <AdminEvents />}
            {activeTab === "services" && <AdminServices />}
            {activeTab === "portfolio" && <AdminPortfolio />}
            {activeTab === "equipment" && <AdminEquipment />}
            {activeTab === "bookings" && <AdminBookings />}
            {activeTab === "contacts" && <AdminContacts />}
            {activeTab === "testimonials" && <AdminTestimonials />}
            {activeTab === "brands" && <AdminBrands />}
            {activeTab === "chat" && <AdminChat />}
            {activeTab === "footer" && <AdminFooter />}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminPage;