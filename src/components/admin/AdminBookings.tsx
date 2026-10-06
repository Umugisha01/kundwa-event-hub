import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Download, FileText, Search, CheckCircle2, AlertCircle, XCircle, Printer } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";

export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, profiles(full_name, email), events(title, ticket_price), equipment(name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      toast({ title: `Booking ${status.toLowerCase()}` });
      load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    if (s === "Approved" || s === "Completed") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === "Pending") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                          b.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
                          (b.booking_type === "event" ? b.events?.title : b.equipment?.name)?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    const matchesType = typeFilter === "All" || b.booking_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportExcel = () => {
    const exportData = filteredBookings.map(b => ({
      ID: b.id,
      Client: b.profiles?.full_name || "N/A",
      Email: b.profiles?.email || "N/A",
      "Booking Type": b.booking_type,
      Item: b.booking_type === "event" ? b.events?.title : b.equipment?.name,
      Amount: b.amount || 0,
      Status: b.status,
      "Created At": new Date(b.created_at).toLocaleString()
    }));
    exportToExcel(exportData, "Bookings_Report");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Client", key: "client" },
      { header: "Booking Type", key: "booking_type" },
      { header: "Booking Item", key: "item" },
      { header: "Amount", key: "amount", format: (v: any) => `${v || 0} RWF` },
      { header: "Status", key: "status" },
      { header: "Date", key: "created_at", format: (v: string) => new Date(v).toLocaleDateString() }
    ];
    
    const mapped = filteredBookings.map(b => ({
      ...b,
      client: b.profiles?.full_name || "N/A",
      item: b.booking_type === "event" ? b.events?.title : b.equipment?.name
    }));
    
    exportToPDF("Bookings Sales & Reservation Registry", columns, mapped);
  };

  const printInvoice = (booking: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print invoices.");
      return;
    }

    const clientName = booking.profiles?.full_name || "Valued Client";
    const clientEmail = booking.profiles?.email || "N/A";
    const itemName = booking.booking_type === "event" ? booking.events?.title : booking.equipment?.name;
    const invoiceNum = `INV-${booking.id.slice(0, 8).toUpperCase()}`;
    const dateStr = new Date(booking.created_at).toLocaleDateString();
    const amountStr = `${(booking.amount || 0).toLocaleString()} RWF`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNum}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              padding: 40px;
              color: #1a202c;
              background-color: #ffffff;
            }
            .invoice-card {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-text {
              font-family: 'Outfit', sans-serif;
              font-size: 26px;
              font-weight: 800;
              color: #13223f;
            }
            .logo-text span {
              color: #f0b429;
            }
            .inv-meta {
              text-align: right;
            }
            .inv-title {
              font-family: 'Outfit', sans-serif;
              font-size: 28px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 5px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
            }
            .section-title {
              font-family: 'Outfit', sans-serif;
              font-size: 12px;
              font-weight: 700;
              color: #718096;
              text-transform: uppercase;
              margin-bottom: 8px;
              letter-spacing: 0.05em;
            }
            .table-invoice {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .table-invoice th {
              background-color: #13223f;
              color: #ffffff;
              text-align: left;
              padding: 12px;
              font-family: 'Outfit', sans-serif;
              font-weight: 600;
              font-size: 13px;
              text-transform: uppercase;
            }
            .table-invoice td {
              padding: 16px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            .totals {
              text-align: right;
              font-size: 16px;
              font-weight: 600;
            }
            .total-amount {
              font-size: 24px;
              font-weight: 700;
              color: #13223f;
              margin-top: 4px;
            }
            .footer-invoice {
              border-top: 1px dashed #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #a0aec0;
              margin-top: 50px;
            }
            @media print {
              body { padding: 0; }
              .invoice-card { border: none; padding: 0; box-shadow: none; }
              .no-print { display: none; }
            }
            .btn-print {
              background-color: #f0b429;
              color: #12141d;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              font-weight: 700;
              border-radius: 8px;
              cursor: pointer;
              font-family: 'Outfit', sans-serif;
              float: right;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <button class="btn-print no-print" onclick="window.print()">Print Invoice</button>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="logo-text">Kundwa <span>IB</span> Group</div>
                <div style="font-size: 12px; color: #718096; margin-top: 5px;">
                  Kigali, Rwanda<br/>
                  info@kundwaib.com<br/>
                  +250 788 000 000
                </div>
              </div>
              <div class="inv-meta">
                <div class="inv-title">INVOICE</div>
                <div style="font-size: 14px; font-weight: 600; color: #4a5568;">Invoice #: ${invoiceNum}</div>
                <div style="font-size: 13px; color: #718096; margin-top: 2px;">Date: ${dateStr}</div>
              </div>
            </div>

            <div class="details-grid">
              <div>
                <div class="section-title">Billed To</div>
                <div style="font-weight: 600; font-size: 15px;">${clientName}</div>
                <div style="font-size: 13px; color: #4a5568; margin-top: 2px;">${clientEmail}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Payment Terms</div>
                <div style="font-weight: 600; font-size: 15px;">Due on Receipt</div>
                <div style="font-size: 13px; color: #4a5568; margin-top: 2px;">Status: ${booking.status}</div>
              </div>
            </div>

            <table class="table-invoice">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600;">${itemName}</td>
                  <td>${booking.booking_type === "event" ? "Event Ticket Purchase" : "Equipment Rental"}</td>
                  <td style="text-align: right; font-weight: 600;">${amountStr}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div>Subtotal: ${amountStr}</div>
              <div style="color: #718096; font-size: 14px; margin-top: 4px;">VAT (0%): 0 RWF</div>
              <div class="total-amount">Total Due: ${amountStr}</div>
            </div>

            <div class="footer-invoice">
              Thank you for choosing Kundwa IB Group. Africa's Premier Event Production.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Header and Export actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-bold text-foreground text-lg">Sales & Bookings ({filteredBookings.length})</h2>
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
            placeholder="Search bookings by client name, item..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9"
          />
        </div>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)} 
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="All">All Types</option>
          <option value="event">Tickets</option>
          <option value="equipment">Rentals</option>
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Bookings Table View - Desktop */}
      <div className="hidden md:block border border-border/40 rounded-xl overflow-hidden bg-card/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="p-3 font-semibold text-muted-foreground">Client Details</th>
                <th className="p-3 font-semibold text-muted-foreground">Booking Item</th>
                <th className="p-3 font-semibold text-muted-foreground">Type</th>
                <th className="p-3 font-semibold text-muted-foreground">Pricing</th>
                <th className="p-3 font-semibold text-muted-foreground">Status</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{b.profiles?.full_name || "User"}</div>
                    <div className="text-xs text-muted-foreground">{b.profiles?.email}</div>
                  </td>
                  <td className="p-3 font-medium text-foreground">
                    {b.booking_type === "event" ? b.events?.title : b.equipment?.name}
                  </td>
                  <td className="p-3">
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted">
                      {b.booking_type === "event" ? "Ticket" : "Rental"}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    {(b.amount || 0).toLocaleString()} RWF
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor(b.status)}`}>
                      {b.status === "Approved" || b.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : null}
                      {b.status === "Pending" ? <AlertCircle className="h-3 w-3" /> : null}
                      {b.status === "Rejected" ? <XCircle className="h-3 w-3" /> : null}
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      {/* Print Invoice Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Print Invoice"
                        onClick={() => printInvoice(b)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      
                      {/* Booking Approval Logic */}
                      {b.status === "Pending" && (
                        <>
                          <Button size="xs" className="btn-gold h-7 text-xs" onClick={() => updateStatus(b.id, "Approved")}>
                            Approve
                          </Button>
                          <Button size="xs" variant="outline" className="h-7 text-xs border-destructive text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "Rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                      {b.status === "Approved" && (
                        <Button size="xs" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, "Completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bookings Card View - Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredBookings.map(b => (
          <div key={b.id} className="card-premium p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-sm">{b.profiles?.full_name || "User"}</h4>
                <p className="text-xs text-muted-foreground">{b.profiles?.email}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor(b.status)}`}>
                {b.status === "Approved" || b.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : null}
                {b.status === "Pending" ? <AlertCircle className="h-3 w-3" /> : null}
                {b.status === "Rejected" ? <XCircle className="h-3 w-3" /> : null}
                {b.status}
              </span>
            </div>
            <div className="flex justify-between text-xs py-2 border-t border-b border-border/40">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Booking Item</span>
                <span className="font-semibold text-foreground">{b.booking_type === "event" ? b.events?.title : b.equipment?.name}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Type</span>
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-muted">
                  {b.booking_type === "event" ? "Ticket" : "Rental"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Amount</span>
                <span className="font-bold text-foreground">{(b.amount || 0).toLocaleString()} RWF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Print Invoice"
                  onClick={() => printInvoice(b)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                {b.status === "Pending" && (
                  <>
                    <Button size="xs" className="btn-gold h-7 text-xs" onClick={() => updateStatus(b.id, "Approved")}>
                      Approve
                    </Button>
                    <Button size="xs" variant="outline" className="h-7 text-xs border-destructive text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "Rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                {b.status === "Approved" && (
                  <Button size="xs" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, "Completed")}>
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredBookings.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No bookings found.</p>
        )}
      </div>
    </div>
  );
}