import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Trash2, Download, FileText, Search, X, CheckCircle2, AlertCircle } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";

export function AdminContacts() {
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.warn("Could not fetch contact submissions:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("contact_submissions").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      
      toast({ title: "Status Updated!", description: `Submission is now marked as ${newStatus}.` });
      
      if (selected && selected.id === id) {
        setSelected({ ...selected, status: newStatus });
      }
      fetchItems();
    } catch (err: any) {
      console.error("Update status failed on database:", err);
      toast({ title: "Failed to Update Status", description: err.message || "Database request could not be completed.", variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Submission Deleted." });
      if (selected && selected.id === id) setSelected(null);
      fetchItems();
    } catch (err: any) {
      console.error("Delete failed on database:", err);
      toast({ title: "Failed to Delete Submission", description: err.message || "Database request could not be completed.", variant: "destructive" });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                          item.email?.toLowerCase().includes(search.toLowerCase()) || 
                          item.message?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      ID: item.id,
      "Full Name": item.full_name,
      Email: item.email,
      Phone: item.phone,
      Message: item.message,
      Status: item.status,
      "Received At": new Date(item.created_at).toLocaleString()
    }));
    exportToExcel(exportData, "Contact_Submissions_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Name", key: "full_name" },
      { header: "Email", key: "email" },
      { header: "Phone", key: "phone" },
      { header: "Status", key: "status" },
      { header: "Received Date", key: "created_at", format: (v: string) => new Date(v).toLocaleDateString() },
      { header: "Message Request", key: "message" }
    ];
    exportToPDF("Contact Service Requests", columns, filteredItems);
  };

  return (
    <div className="space-y-4">
      {/* Header & Export Options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Contact Submissions ({filteredItems.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial">
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial">
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages by name, email, keywords..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table/List View - Left Column */}
        <div className={`lg:col-span-2 space-y-3 ${selected ? "hidden lg:block" : "block"}`}>
          {/* Desktop Table View */}
          <div className="hidden md:block border border-border/40 rounded-xl overflow-hidden bg-card/40">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="p-3 font-semibold text-muted-foreground">User Details</th>
                    <th className="p-3 font-semibold text-muted-foreground">Status</th>
                    <th className="p-3 font-semibold text-muted-foreground">Date</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelected(item)}
                      className={`border-b border-border/40 hover:bg-muted/10 cursor-pointer transition-colors ${selected?.id === item.id ? "bg-muted/20" : ""}`}
                    >
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{item.full_name}</div>
                        <div className="text-xs text-muted-foreground">{item.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "Resolved" ? "bg-emerald-500/10 text-emerald-500" :
                          item.status === "In Progress" ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          {item.status === "Resolved" && <CheckCircle2 className="h-3 w-3" />}
                          {item.status === "Pending" && <AlertCircle className="h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => remove(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                        No service requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelected(item)}
                className={`card-premium p-4 space-y-3 cursor-pointer transition-all border-l-4 ${
                  selected?.id === item.id ? "border-l-secondary bg-muted/20" : "border-l-primary"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{item.full_name}</h4>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === "Resolved" ? "bg-emerald-500/10 text-emerald-500" :
                    item.status === "In Progress" ? "bg-amber-500/10 text-amber-500" :
                    "bg-red-500/10 text-red-500"
                  }`}>
                    {item.status === "Resolved" && <CheckCircle2 className="h-3 w-3" />}
                    {item.status === "Pending" && <AlertCircle className="h-3 w-3" />}
                    {item.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                  <span>Date: {new Date(item.created_at).toLocaleDateString()}</span>
                  <div onClick={e => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">No service requests found.</p>
            )}
          </div>
        </div>

        {/* Selected Submission Drawer/Card - Right Column */}
        <div className={`lg:col-span-1 ${selected ? "block" : "hidden lg:block"}`}>
          {selected ? (
            <div className="card-premium p-6 space-y-4 animate-scale-in">
              {/* Mobile Back Button */}
              <div className="flex items-center gap-2 mb-1 lg:hidden">
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="px-2">
                  &larr; Back to Messages
                </Button>
              </div>

              <div className="flex justify-between items-start border-b border-border/40 pb-2">
                <div>
                  <h3 className="font-bold text-foreground text-md">Request Details</h3>
                  <p className="text-[10px] text-muted-foreground">ID: {selected.id}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Client Name</label>
                  <div className="font-semibold text-foreground text-base">{selected.full_name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Email</label>
                    <div className="text-foreground break-all text-xs">{selected.email}</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Phone</label>
                    <div className="text-foreground text-xs">{selected.phone || "N/A"}</div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Message</label>
                  <div className="p-3 bg-muted/30 rounded-lg text-foreground leading-relaxed text-xs max-h-40 overflow-y-auto border border-border/25">
                    {selected.message}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant={selected.status === "Pending" ? "default" : "outline"}
                      className={selected.status === "Pending" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                      onClick={() => updateStatus(selected.id, "Pending")}
                    >
                      Pending
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selected.status === "In Progress" ? "default" : "outline"}
                      className={selected.status === "In Progress" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                      onClick={() => updateStatus(selected.id, "In Progress")}
                    >
                      In Progress
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selected.status === "Resolved" ? "default" : "outline"}
                      className={selected.status === "Resolved" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                      onClick={() => updateStatus(selected.id, "Resolved")}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-premium p-8 text-center text-muted-foreground text-sm border-dashed">
              Select a contact submission from the list to view the full message, update status, or take actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
