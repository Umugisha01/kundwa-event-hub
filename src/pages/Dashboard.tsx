import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, Wrench, CreditCard, BarChart3, User } from "lucide-react";

const stats = [
  { label: "Active Bookings", value: "3", icon: Calendar, color: "text-secondary" },
  { label: "My Tickets", value: "5", icon: Ticket, color: "text-secondary" },
  { label: "Equipment Rentals", value: "2", icon: Wrench, color: "text-secondary" },
  { label: "Total Spent", value: "450,000 RWF", icon: CreditCard, color: "text-secondary" },
];

const bookings = [
  { title: "Sound System - Professional Package", date: "May 10, 2026", status: "Confirmed", amount: "500,000 RWF" },
  { title: "Lighting Design - Premium", date: "June 15, 2026", status: "Pending", amount: "900,000 RWF" },
  { title: "Stage Design - Basic", date: "July 2, 2026", status: "Confirmed", amount: "300,000 RWF" },
];

const tickets = [
  { event: "Kigali Music Festival 2026", type: "VIP", date: "May 15, 2026", code: "KMF-2026-VIP-001" },
  { event: "Rwanda Tech Summit", type: "Standard", date: "June 20, 2026", code: "RTS-2026-STD-042" },
];

const DashboardPage = () => {
  return (
    <Layout>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground text-sm">Manage your bookings, tickets, and rentals</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="card-premium p-5">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bookings */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" /> My Bookings
              </h2>
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground text-sm">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.status === "Confirmed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                        {b.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{b.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="card-premium p-6">
              <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-secondary" /> My Tickets
              </h2>
              <div className="space-y-3">
                {tickets.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground text-sm">{t.event}</p>
                      <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{t.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{t.date}</p>
                    <div className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="w-24 h-24 mx-auto bg-foreground/10 rounded-lg flex items-center justify-center mb-2">
                        <BarChart3 className="h-12 w-12 text-foreground/30" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{t.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;
