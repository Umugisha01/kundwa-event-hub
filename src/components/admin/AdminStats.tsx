import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function AdminStats() {
  const [stats, setStats] = useState({ events_produced: 0, attendees_served: 0, years_experience: 0, countries_reached: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("site_statistics").select("*").single().then(({ data }) => {
      if (data) setStats(data);
    });
  }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_statistics").update({ ...stats, updated_at: new Date().toISOString() }).eq("id", stats.id || "");
    setLoading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Statistics updated!" });
  };

  return (
    <div className="card-premium p-6">
      <h2 className="font-bold text-foreground text-lg mb-4">Site Statistics</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: "events_produced", label: "Events Produced" },
          { key: "attendees_served", label: "Attendees Served" },
          { key: "years_experience", label: "Years of Experience" },
          { key: "countries_reached", label: "Countries Reached" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="text-sm text-muted-foreground">{label}</label>
            <Input
              type="number"
              value={(stats as any)[key]}
              onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) || 0 })}
            />
          </div>
        ))}
      </div>
      <Button className="btn-gold mt-4" onClick={save} disabled={loading}>
        <Save className="h-4 w-4 mr-1" /> {loading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}