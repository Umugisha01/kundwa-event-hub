import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function AdminFooter() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    supabase.from("footer_settings").select("*").single().then(({ data }) => setData(data));
  }, []);

  const save = async () => {
    if (!data) return;
    const { id, ...rest } = data;
    const { error } = await supabase.from("footer_settings").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Footer updated!" });
  };

  if (!data) return <p className="text-muted-foreground">Loading...</p>;

  const fields = [
    { key: "contact_email", label: "Email" },
    { key: "contact_phone", label: "Phone" },
    { key: "contact_address", label: "Address" },
    { key: "facebook_url", label: "Facebook URL" },
    { key: "instagram_url", label: "Instagram URL" },
    { key: "twitter_url", label: "Twitter URL" },
    { key: "youtube_url", label: "YouTube URL" },
    { key: "copyright_text", label: "Copyright Text" },
  ];

  return (
    <div className="card-premium p-6 space-y-4">
      <h2 className="font-bold text-foreground text-lg">Footer Settings</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-sm text-muted-foreground">{label}</label>
            <Input value={data[key] || ""} onChange={(e) => setData({ ...data, [key]: e.target.value })} />
          </div>
        ))}
      </div>
      <Button className="btn-gold" onClick={save}><Save className="h-4 w-4 mr-1" /> Save</Button>
    </div>
  );
}