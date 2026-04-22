import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("bookings").select("*, profiles(full_name, email), events(title), equipment(name)").order("created_at", { ascending: false });
    setBookings(data || []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `Booking ${status.toLowerCase()}` }); load();
  };

  const statusColor = (s: string) => {
    if (s === "Approved" || s === "Completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s === "Pending") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-foreground text-lg">All Bookings ({bookings.length})</h2>
      {bookings.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
      <div className="space-y-2">
        {bookings.map((b) => (
          <div key={b.id} className="card-premium p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{b.profiles?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{b.profiles?.email}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {b.booking_type === "event" ? b.events?.title : b.equipment?.name} — {b.booking_type}
            </p>
            {b.status === "Pending" && (
              <div className="flex gap-2">
                <Button size="sm" className="btn-gold" onClick={() => updateStatus(b.id, "Approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Rejected")}>Reject</Button>
              </div>
            )}
            {b.status === "Approved" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "Completed")}>Mark Completed</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}