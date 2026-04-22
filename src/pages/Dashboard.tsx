import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar, Ticket, Wrench, User, LogOut, Edit2, Save, X } from "lucide-react";

const DashboardPage = () => {
  const { user, profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone || "" });
    }
  }, [profile]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, events(title, date), equipment(name)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
  };

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("tickets")
      .select("*, events(title, date, location)")
      .eq("user_id", user!.id)
      .order("purchased_at", { ascending: false });
    setTickets(data || []);
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone, updated_at: new Date().toISOString() })
      .eq("id", user!.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditing(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "Approved" || status === "Completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {profile?.full_name || "User"}!
                </h1>
                <p className="text-muted-foreground text-sm">Manage your bookings, tickets, and profile</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="card-premium p-5">
              <Calendar className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </div>
            <div className="card-premium p-5">
              <Ticket className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              <p className="text-xs text-muted-foreground">Tickets</p>
            </div>
            <div className="card-premium p-5">
              <Wrench className="h-5 w-5 text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {bookings.filter((b) => b.booking_type === "equipment").length}
              </p>
              <p className="text-xs text-muted-foreground">Equipment Rentals</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bookings */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" /> My Bookings
              </h2>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {b.events?.title || b.equipment?.name || "Booking"}
                        </p>
                        <p className="text-xs text-muted-foreground">{b.booking_type}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tickets */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-secondary" /> My Tickets
              </h2>
              {tickets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tickets yet.</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground text-sm">{t.events?.title}</p>
                        <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {t.ticket_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.events?.date && new Date(t.events.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{t.ticket_code}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="card-premium p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" /> My Profile
                </h2>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="btn-gold" onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  {editing ? (
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  ) : (
                    <p className="text-foreground font-medium">{profile?.full_name || "-"}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-foreground font-medium">{profile?.email || user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  {editing ? (
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  ) : (
                    <p className="text-foreground font-medium">{profile?.phone || "-"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;
