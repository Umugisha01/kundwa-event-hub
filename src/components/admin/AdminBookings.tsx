import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Download, FileText, Search, CheckCircle2, AlertCircle, XCircle, Printer,
  Eye, Phone, Mail, MessageSquare, Wrench, Calendar, Clock, Truck,
  Layers, Ticket, Sparkles, Filter, LayoutGrid, ListFilter, Check,
  ChevronRight, ArrowUpRight, ShieldCheck, MapPin, Info, User
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { resolveMediaUrl } from "@/config/api";

export function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "rentals" | "tickets" | "services">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, profiles(full_name, email, phone), events(title, ticket_price), equipment(id, name, category, image_url, description)")
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
      toast({ title: `Booking updated to ${status}` });
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev: any) => ({ ...prev, status }));
      }
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

  const getItemName = (b: any) => {
    if (b.booking_type === "service") return b.service_name || "Event Production Service";
    if (b.booking_type === "event") return b.events?.title || "Event Ticket";
    return b.equipment_name || b.equipment?.name || "Equipment Rental";
  };

  const getClientName = (b: any) => {
    return b.customer_name || b.profiles?.full_name || "Valued Client";
  };

  const getClientEmail = (b: any) => {
    return b.customer_email || b.profiles?.email || "N/A";
  };

  const getClientPhone = (b: any) => {
    return b.customer_phone || b.profiles?.phone || "";
  };

  // Filtered lists
  const allFiltered = useMemo(() => {
    return bookings.filter(b => {
      const q = search.toLowerCase();
      const client = getClientName(b).toLowerCase();
      const email = getClientEmail(b).toLowerCase();
      const phone = getClientPhone(b).toLowerCase();
      const item = getItemName(b).toLowerCase();
      const notes = (b.notes || "").toLowerCase();

      const matchesSearch = client.includes(q) || email.includes(q) || phone.includes(q) || item.includes(q) || notes.includes(q);
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      
      let matchesTab = true;
      if (activeTab === "rentals") matchesTab = b.booking_type === "equipment";
      else if (activeTab === "tickets") matchesTab = b.booking_type === "event";
      else if (activeTab === "services") matchesTab = b.booking_type === "service";

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [bookings, search, statusFilter, activeTab]);

  // Specific counts
  const counts = useMemo(() => {
    const rentals = bookings.filter(b => b.booking_type === "equipment");
    const tickets = bookings.filter(b => b.booking_type === "event");
    const services = bookings.filter(b => b.booking_type === "service");
    
    return {
      all: bookings.length,
      rentals: rentals.length,
      rentalsPending: rentals.filter(r => r.status === "Pending").length,
      rentalsApproved: rentals.filter(r => r.status === "Approved" || r.status === "Completed").length,
      rentalsSetup: rentals.filter(r => r.include_setup).length,
      tickets: tickets.length,
      services: services.length,
    };
  }, [bookings]);

  const handleExportExcel = () => {
    const exportData = allFiltered.map(b => {
      const isRental = b.booking_type === "equipment";
      return {
        "ID": b.id,
        "Type": b.booking_type === "equipment" ? "Equipment Rental" : b.booking_type === "event" ? "Event Ticket" : "Service Inquiry",
        "Client Name": getClientName(b),
        "Email": getClientEmail(b),
        "Phone": getClientPhone(b) || "N/A",
        "Booking Item": getItemName(b),
        "Equipment Category": isRental ? (b.equipment?.category || "Equipment") : "N/A",
        "Start Date": b.start_date || "N/A",
        "End Date": b.end_date || "N/A",
        "Operating Time": isRental && b.start_time ? `${b.start_time} - ${b.end_time || ""}` : "N/A",
        "Rental Duration (Days)": isRental ? (b.rental_days || 1) : "N/A",
        "Setup & Transport Requested": isRental ? (b.include_setup ? "Yes" : "No (Self-Pickup)") : "N/A",
        "Special Descriptions / Notes": b.notes || "",
        ...(isRental ? {} : { "Amount (RWF)": b.amount || 0 }),
        "Status": b.status,
        "Created At": new Date(b.created_at).toLocaleString()
      };
    });
    exportToExcel(exportData, activeTab === "rentals" ? "Equipment_Rentals_Registry" : "Bookings_Sales_Report");
  };

  const handleExportPDF = () => {
    const isRentalTab = activeTab === "rentals";
    const columns = isRentalTab ? [
      { header: "Client", key: "client" },
      { header: "Contact", key: "contact" },
      { header: "Rented Equipment", key: "item" },
      { header: "Schedule & Duration", key: "schedule" },
      { header: "Transport / Setup", key: "setup" },
      { header: "Special Notes", key: "notes" },
      { header: "Status", key: "status" }
    ] : [
      { header: "Client", key: "client" },
      { header: "Contact", key: "contact" },
      { header: "Type", key: "booking_type" },
      { header: "Booking Item", key: "item" },
      { header: "Schedule", key: "schedule" },
      { header: "Amount / Status", key: "amount" },
      { header: "Status", key: "status" }
    ];
    
    const mapped = allFiltered.map(b => {
      const isRental = b.booking_type === "equipment";
      const schedule = isRental && b.start_date
        ? `${b.start_date} → ${b.end_date || b.start_date} (${b.rental_days || 1}d) [${b.start_time || "08:00"}-${b.end_time || "18:00"}]`
        : b.start_date || "N/A";
      return {
        ...b,
        client: getClientName(b),
        contact: getClientPhone(b) || getClientEmail(b) || "N/A",
        item: getItemName(b),
        schedule,
        setup: b.include_setup ? "Setup Requested" : "Self-Pickup",
        notes: b.notes || "-",
        amount: b.booking_type === "event" ? `${Number(b.amount || 0).toLocaleString()} RWF` : "-"
      };
    });
    
    exportToPDF(isRentalTab ? "Kundwa Equipment Rentals & Dispatch Registry" : "Sales & Bookings Registry", columns, mapped);
  };

  const printInvoice = (booking: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print invoices.");
      return;
    }

    const isRental = booking.booking_type === "equipment";
    const clientName = getClientName(booking);
    const clientEmail = getClientEmail(booking);
    const clientPhone = getClientPhone(booking);
    const itemName = getItemName(booking);
    const docRef = `${isRental ? "RENTAL" : "INV"}-${booking.id.slice(0, 8).toUpperCase()}`;
    const dateStr = new Date(booking.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const amountStr = booking.amount ? `${Number(booking.amount).toLocaleString()} RWF` : "Quote On Request";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isRental ? "Equipment Rental Slip" : "Invoice"} - ${docRef}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              padding: 40px;
              color: #1a202c;
              background-color: #ffffff;
            }
            .invoice-card {
              max-width: 820px;
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
              font-size: 24px;
              font-weight: 800;
              color: #1a202c;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .section-title {
              font-weight: 700;
              color: #718096;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
            }
            .rental-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 25px;
            }
            .notes-box {
              background: #fffdf5;
              border: 1px solid #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 6px;
              padding: 14px;
              margin-bottom: 25px;
            }
            .notes-title {
              font-weight: 700;
              font-size: 12px;
              color: #92400e;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .notes-content {
              font-size: 13px;
              color: #78350f;
              line-height: 1.5;
            }
            .table-invoice {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .table-invoice th, .table-invoice td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
              font-size: 14px;
            }
            .table-invoice th {
              background-color: #f8fafc;
              color: #4a5568;
              font-weight: 600;
              font-size: 12px;
              text-transform: uppercase;
            }
            .totals {
              text-align: right;
              margin-bottom: 40px;
            }
            .total-amount {
              font-size: 20px;
              font-weight: 800;
              color: #13223f;
              margin-top: 6px;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 60px;
              margin-top: 50px;
              padding-top: 25px;
              border-top: 1px dashed #cbd5e1;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              margin-top: 45px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              padding-top: 6px;
            }
            .footer-invoice {
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #718096;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="logo-text">KUNDWA <span>IB GROUP</span></div>
                <div style="color: #718096; font-size: 12px; margin-top: 4px;">Africa's Premier Event Production & Equipment Hub</div>
                <div style="color: #718096; font-size: 12px;">Kigali, Rwanda • info@kundwaevents.com • +250 784 289 407</div>
              </div>
              <div class="inv-meta">
                <div class="inv-title">${isRental ? "Equipment Rental Agreement" : "Official Invoice"}</div>
                <div style="font-size: 14px; color: #4a5568; margin-top: 4px;"><strong>Reference:</strong> ${docRef}</div>
                <div style="font-size: 13px; color: #718096;">Date: ${dateStr}</div>
                <div style="font-size: 13px; color: #718096; margin-top: 2px;">Status: <strong>${booking.status}</strong></div>
              </div>
            </div>

            <div class="details-grid">
              <div>
                <div class="section-title">Client / Renter Information</div>
                <div style="font-weight: 700; font-size: 15px;">${clientName}</div>
                <div style="font-size: 13px; color: #4a5568; margin-top: 2px;">Email: ${clientEmail}</div>
                <div style="font-size: 13px; color: #4a5568;">Phone: ${clientPhone || "N/A"}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Terms & Logistics</div>
                <div style="font-weight: 600; font-size: 14px;">${isRental ? (booking.include_setup ? "Transport & On-Site Setup: YES" : "Client Self-Pickup") : "Due on Receipt"}</div>
                <div style="font-size: 13px; color: #4a5568; margin-top: 2px;">Booking Type: <strong>${isRental ? "Equipment Rental" : booking.booking_type}</strong></div>
              </div>
            </div>

            ${isRental && booking.start_date ? `
              <div class="rental-box">
                <div class="section-title" style="margin-bottom: 8px;">Rental Schedule & Operating Window</div>
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                  <div><strong>Pickup / Start:</strong> ${booking.start_date}</div>
                  <div><strong>Return / End:</strong> ${booking.end_date || booking.start_date}</div>
                  <div><strong>Duration:</strong> ${booking.rental_days || 1} Day(s)</div>
                  <div><strong>Hours:</strong> ${booking.start_time || "08:00"} – ${booking.end_time || "18:00"}</div>
                </div>
              </div>
            ` : ""}

            ${booking.notes ? `
              <div class="notes-box">
                <div class="notes-title">Special Technical Descriptions & Client Notes</div>
                <div class="notes-content">"${booking.notes}"</div>
              </div>
            ` : ""}

            <table class="table-invoice">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th>Category / Type</th>
                  <th>Duration / Window</th>
                  <th style="text-align: right;">${isRental ? "Logistics & Setup" : "Amount"}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700;">${itemName}</td>
                  <td>${isRental ? (booking.equipment?.category || "Equipment Rental") : booking.booking_type}</td>
                  <td>${isRental ? `${booking.rental_days || 1} day(s) (${booking.start_date || "N/A"} to ${booking.end_date || booking.start_date})` : "1"}</td>
                  <td style="text-align: right; font-weight: 700;">${isRental ? (booking.include_setup ? "Setup & Transport Requested" : "Self-Pickup") : amountStr}</td>
                </tr>
              </tbody>
            </table>

            ${!isRental ? `
              <div class="totals">
                <div>Subtotal: ${amountStr}</div>
                <div style="color: #718096; font-size: 13px; margin-top: 4px;">VAT (0%): 0 RWF</div>
                <div class="total-amount">Total Balance: ${amountStr}</div>
              </div>
            ` : ""}

            ${isRental ? `
              <div class="signatures">
                <div>
                  <div class="section-title">Kundwa IB Group Technical Dispatch</div>
                  <div class="sig-line">Authorized Technician Signature & Date</div>
                </div>
                <div>
                  <div class="section-title">Client / Equipment Receiver</div>
                  <div class="sig-line">Client Signature & Date</div>
                </div>
              </div>
            ` : ""}

            <div class="footer-invoice">
              Thank you for trusting Kundwa IB Group — Africa's Premier Event Production & Technology.
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
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-foreground text-xl flex items-center gap-2">
            <span>Sales & Bookings Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-bold">
              {bookings.length} Total
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer equipment rentals, event tickets, and production service inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 flex-1 sm:flex-initial text-xs">
            <Download className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 flex-1 sm:flex-initial text-xs">
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "all"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>All Bookings</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "all" ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rentals")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "rentals"
                ? "bg-secondary text-secondary-foreground shadow-sm font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Rented Items Hub</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === "rentals" ? "bg-secondary-foreground/20 text-secondary-foreground" : "bg-amber-500/15 text-amber-500 font-extrabold"
            }`}>
              {counts.rentals}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tickets"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Event Tickets</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "tickets" ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
            }`}>
              {counts.tickets}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "services"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Service Requests</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "services" ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
            }`}>
              {counts.services}
            </span>
          </button>
        </div>

        {/* View Mode Toggle when on Rentals */}
        {activeTab === "rentals" && (
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "cards" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Equipment Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <ListFilter className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Rented Items KPI Dashboard when on Rentals Tab */}
      {activeTab === "rentals" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card-premium p-4 rounded-xl border border-border/40 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="font-semibold">Total Rented Items</span>
              <Wrench className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{counts.rentals}</div>
            <p className="text-[11px] text-muted-foreground">Equipment rentals processed</p>
          </div>

          <div className="card-premium p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <div className="flex items-center justify-between text-amber-500 text-xs font-semibold">
              <span>Pending Confirmation</span>
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{counts.rentalsPending}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting admin review</p>
          </div>

          <div className="card-premium p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <div className="flex items-center justify-between text-emerald-500 text-xs font-semibold">
              <span>Approved / Dispatched</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{counts.rentalsApproved}</div>
            <p className="text-[11px] text-muted-foreground">Confirmed rentals</p>
          </div>

          <div className="card-premium p-4 rounded-xl border border-border/40 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Transport & Setup</span>
              <Truck className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{counts.rentalsSetup}</div>
            <p className="text-[11px] text-muted-foreground">On-site technical crew requested</p>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={
              activeTab === "rentals" 
                ? "Search rented equipment, client name, special notes..." 
                : "Search bookings by client name, item, email..."
            } 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 text-xs h-9"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="border border-input bg-background rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Rented Items Visual Cards Grid View (Active when on Rentals and ViewMode === "cards") */}
      {activeTab === "rentals" && viewMode === "cards" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allFiltered.map((b) => {
              const clientName = getClientName(b);
              const clientPhone = getClientPhone(b);
              const cleanPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, "") : "";
              const clientEmail = getClientEmail(b);
              const itemName = getItemName(b);
              const imageUrl = resolveMediaUrl(b.equipment?.image_url);

              return (
                <div
                  key={b.id}
                  className="card-premium p-4 rounded-2xl border border-border/50 hover:border-secondary/40 transition-all flex flex-col justify-between space-y-3.5 shadow-sm bg-card/60"
                >
                  {/* Top Item Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={itemName} className="w-full h-full object-cover" />
                          ) : (
                            <Wrench className="h-6 w-6 text-secondary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                              {b.equipment?.category || "Equipment"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-foreground text-sm mt-1 leading-snug line-clamp-1">
                            {itemName}
                          </h4>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            ID: {b.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Timing Pills */}
                    <div className="mt-3 p-2.5 rounded-xl bg-muted/30 border border-border/30 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px] font-medium">
                          <Calendar className="h-3 w-3 text-secondary shrink-0" />
                          <span>Dates:</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {b.start_date ? `${b.start_date} → ${b.end_date || b.start_date}` : "Not scheduled"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1 text-[11px] font-medium">
                          <Clock className="h-3 w-3 text-secondary shrink-0" />
                          <span>Hours:</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {b.start_time ? `${b.start_time} – ${b.end_time || ""}` : "All day"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/20">
                        <span className="text-[11px] text-muted-foreground">Duration:</span>
                        <span className="font-bold text-secondary text-[11px]">
                          {b.rental_days || 1} day(s) rental
                        </span>
                      </div>
                    </div>

                    {/* Transport & Setup Badge */}
                    <div className="mt-2.5">
                      {b.include_setup ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-semibold">
                          <Truck className="h-3.5 w-3.5 shrink-0" />
                          <span>Transport & Technical Crew Setup Requested</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/30 px-2.5 py-1 rounded-lg">
                          <Truck className="h-3.5 w-3.5 shrink-0 opacity-50" />
                          <span>Self-Pickup by Renter (No transport)</span>
                        </div>
                      )}
                    </div>

                    {/* Special Descriptions & Requirements (Notes) */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                        <FileText className="h-3 w-3 text-secondary" />
                        Special Instructions / Descriptions:
                      </span>
                      {b.notes ? (
                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground italic leading-relaxed line-clamp-3">
                          "{b.notes}"
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground/60 italic p-2 rounded bg-muted/20">
                          Standard equipment rental. No special specifications provided.
                        </div>
                      )}
                    </div>

                    {/* Client Info Card */}
                    <div className="mt-3 pt-2.5 border-t border-border/30 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Renter:</span>
                        <span className="font-bold text-foreground truncate max-w-[170px]">{clientName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground text-[11px]">Email:</span>
                        <span className="text-muted-foreground truncate max-w-[170px] text-[11px]">{clientEmail}</span>
                      </div>
                      {clientPhone && (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground text-[11px]">Phone:</span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${clientName}, regarding your rented equipment (${itemName}) at Kundwa IB Group:`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-500 hover:underline font-bold text-[11px] flex items-center gap-1"
                            >
                              <MessageSquare className="h-3 w-3" /> WhatsApp
                            </a>
                            <span className="text-muted-foreground/30">•</span>
                            <a href={`tel:${clientPhone}`} className="text-muted-foreground hover:text-foreground text-[11px]">
                              {clientPhone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Duration:</span>
                      <span className="font-bold text-xs text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                        {b.rental_days || 1} {b.rental_days === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Full Rental Dossier"
                        onClick={() => setSelectedBooking(b)}
                        className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Print Rental Slip & Agreement"
                        onClick={() => printInvoice(b)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>

                      {b.status === "Pending" && (
                        <>
                          <Button size="sm" className="btn-gold h-7 text-xs px-2.5" onClick={() => updateStatus(b.id, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "Rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
                      {b.status === "Approved" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, "Completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allFiltered.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20 space-y-2">
              <Wrench className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-foreground text-sm">No rented items found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No equipment rentals match your search or status filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Structured Table View (Desktop & Tablet) */}
      {(activeTab !== "rentals" || viewMode === "table") && (
        <div className="border border-border/40 rounded-xl overflow-hidden bg-card/40">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-3 font-semibold text-muted-foreground text-xs">
                    {activeTab === "rentals" ? "Rented Equipment" : "Booking Item"}
                  </th>
                  <th className="p-3 font-semibold text-muted-foreground text-xs">Client Details</th>
                  <th className="p-3 font-semibold text-muted-foreground text-xs">Schedule & Logistics</th>
                  {activeTab === "rentals" && (
                    <th className="p-3 font-semibold text-muted-foreground text-xs">Special Descriptions (Notes)</th>
                  )}
                  <th className="p-3 font-semibold text-muted-foreground text-xs">Type</th>
                  {activeTab !== "rentals" && (
                    <th className="p-3 font-semibold text-muted-foreground text-xs">Pricing</th>
                  )}
                  <th className="p-3 font-semibold text-muted-foreground text-xs">Status</th>
                  <th className="p-3 font-semibold text-muted-foreground text-right text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allFiltered.map(b => {
                  const phone = getClientPhone(b);
                  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
                  const clientName = getClientName(b);
                  const clientEmail = getClientEmail(b);
                  const itemName = getItemName(b);
                  const isRental = b.booking_type === "equipment";
                  const imageUrl = resolveMediaUrl(b.equipment?.image_url);

                  return (
                    <tr key={b.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      {/* Item */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {isRental ? (
                            <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center shrink-0 overflow-hidden">
                              {imageUrl ? (
                                <img src={imageUrl} alt={itemName} className="w-full h-full object-cover" />
                              ) : (
                                <Wrench className="h-4 w-4 text-secondary" />
                              )}
                            </div>
                          ) : null}
                          <div>
                            <div className="font-bold text-foreground text-xs">{itemName}</div>
                            {isRental && (
                              <span className="text-[10px] text-secondary font-medium">
                                {b.equipment?.category || "Equipment"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="p-3">
                        <div className="font-semibold text-foreground text-xs">{clientName}</div>
                        <div className="text-[11px] text-muted-foreground">{clientEmail}</div>
                        {phone && (
                          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${clientName}, regarding your booking for ${itemName}:`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-500 hover:underline flex items-center gap-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="h-3 w-3" /> WhatsApp
                            </a>
                            <span className="text-muted-foreground/30">•</span>
                            <a href={`tel:${phone}`} className="text-muted-foreground hover:text-foreground">
                              {phone}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Schedule & Logistics */}
                      <td className="p-3 text-xs">
                        {b.start_date ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground flex items-center gap-1 text-[11px]">
                              <Calendar className="h-3 w-3 text-secondary shrink-0" />
                              <span>{b.start_date} {b.end_date ? `→ ${b.end_date}` : ""}</span>
                            </div>
                            {isRental && (
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 text-secondary shrink-0" />
                                <span>{b.start_time || "08:00"} - {b.end_time || "18:00"} ({b.rental_days || 1}d)</span>
                              </div>
                            )}
                            {isRental && (
                              <div className="pt-0.5">
                                {b.include_setup ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                    Setup Req.
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                                    Self-Pickup
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </td>

                      {/* Notes Column (for rentals) */}
                      {activeTab === "rentals" && (
                        <td className="p-3 text-xs max-w-xs">
                          {b.notes ? (
                            <div className="p-2 rounded-lg bg-muted/40 border border-border/30 text-[11px] italic text-foreground line-clamp-2">
                              "{b.notes}"
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 text-[11px]">-</span>
                          )}
                        </td>
                      )}

                      {/* Type */}
                      <td className="p-3">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                          b.booking_type === "service" ? "bg-sky-500/10 text-sky-400" :
                          b.booking_type === "event" ? "bg-purple-500/10 text-purple-400" :
                          "bg-amber-500/10 text-amber-400 font-bold"
                        }`}>
                          {b.booking_type === "service" ? "Service" : b.booking_type === "event" ? "Ticket" : "Rental"}
                        </span>
                      </td>

                      {/* Pricing (Hidden on Rentals tab) */}
                      {activeTab !== "rentals" && (
                        <td className="p-3 text-xs font-semibold text-foreground">
                          {b.booking_type === "event" ? `${Number(b.amount || 0).toLocaleString()} RWF` : "-"}
                        </td>
                      )}

                      {/* Status */}
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor(b.status)}`}>
                          {b.status === "Approved" || b.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {b.status === "Pending" ? <AlertCircle className="h-3 w-3" /> : null}
                          {b.status === "Rejected" ? <XCircle className="h-3 w-3" /> : null}
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Full Details"
                            onClick={() => setSelectedBooking(b)}
                            className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Print Invoice / Rental Slip"
                            onClick={() => printInvoice(b)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          
                          {b.status === "Pending" && (
                            <>
                              <Button size="sm" className="btn-gold h-7 text-xs px-2.5" onClick={() => updateStatus(b.id, "Approved")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "Rejected")}>
                                Reject
                              </Button>
                            </>
                          )}
                          {b.status === "Approved" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, "Completed")}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {allFiltered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Booking & Rental Dossier Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                selectedBooking?.booking_type === "equipment" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-secondary/10 text-secondary border-secondary/20"
              }`}>
                {selectedBooking?.booking_type === "equipment" ? "Equipment Rental Reservation" : selectedBooking?.booking_type}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(selectedBooking?.status)}`}>
                {selectedBooking?.status}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground mt-1">
              {selectedBooking && getItemName(selectedBooking)}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ref ID: <span className="font-mono">{selectedBooking?.id}</span> • Created {selectedBooking && new Date(selectedBooking.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 text-xs mt-2">
              {/* Equipment Photo & Header (if rental) */}
              {selectedBooking.booking_type === "equipment" && (
                <div className="p-3.5 rounded-xl bg-card border border-border/50 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-muted/60 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
                    {resolveMediaUrl(selectedBooking.equipment?.image_url) ? (
                      <img src={resolveMediaUrl(selectedBooking.equipment?.image_url)} alt="Equipment" className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="h-8 w-8 text-secondary" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-secondary">
                      {selectedBooking.equipment?.category || "Equipment"}
                    </span>
                    <h3 className="font-extrabold text-foreground text-sm leading-snug">
                      {getItemName(selectedBooking)}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {selectedBooking.equipment?.description || "Professional grade production equipment."}
                    </p>
                  </div>
                </div>
              )}

              {/* Client Dossier Card */}
              <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-secondary" /> Client Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Full Name:</span>
                    <span className="font-bold text-foreground">{getClientName(selectedBooking)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Email Address:</span>
                    <span className="font-medium text-foreground">{getClientEmail(selectedBooking)}</span>
                  </div>
                </div>

                {getClientPhone(selectedBooking) && (
                  <div className="pt-2 border-t border-border/40 flex gap-2">
                    <a
                      href={`https://wa.me/${getClientPhone(selectedBooking).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${getClientName(selectedBooking)}, regarding your ${selectedBooking.booking_type === "equipment" ? "equipment rental" : "booking"} for ${getItemName(selectedBooking)}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold text-xs text-center flex items-center justify-center gap-1.5 border border-emerald-500/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Client
                    </a>
                    <a
                      href={`tel:${getClientPhone(selectedBooking)}`}
                      className="py-2 px-3 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold text-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call {getClientPhone(selectedBooking)}
                    </a>
                  </div>
                )}
              </div>

              {/* Rental Schedule & Logistics Card */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-secondary" /> Schedule & Logistics
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Rental Period:</span>
                    <span className="font-semibold text-foreground">
                      {selectedBooking.start_date ? `${selectedBooking.start_date} → ${selectedBooking.end_date || selectedBooking.start_date}` : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Operating Hours:</span>
                    <span className="font-semibold text-foreground">
                      {selectedBooking.start_time ? `${selectedBooking.start_time} – ${selectedBooking.end_time || ""}` : "All day"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Duration:</span>
                    <span className="font-bold text-secondary">
                      {selectedBooking.rental_days || 1} day(s) rental
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Transport & Setup:</span>
                    <span className={`font-bold ${selectedBooking.include_setup ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {selectedBooking.include_setup ? "Requested (Technical crew dispatched)" : "Self-Pickup / Client rigging"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Descriptions & Requirements (Notes Callout) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-secondary" />
                  Special Technical Descriptions & Client Notes:
                </span>
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/30 text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedBooking.notes ? (
                    <span className="italic font-medium">"{selectedBooking.notes}"</span>
                  ) : (
                    <span className="text-muted-foreground italic">Standard order. No special specifications provided.</span>
                  )}
                </div>
              </div>

              {/* Financial Rate (Only for Non-Rentals, e.g. Tickets) */}
              {selectedBooking.booking_type !== "equipment" && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-semibold">Total Pricing:</span>
                  <span className="font-extrabold text-base text-foreground">
                    {selectedBooking.amount ? `${Number(selectedBooking.amount).toLocaleString()} RWF` : "-"}
                  </span>
                </div>
              )}

              {/* Actions & Status Controls */}
              <div className="pt-3 border-t border-border/40 flex flex-wrap justify-between items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printInvoice(selectedBooking)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Rental Slip / Invoice
                </Button>

                <div className="flex gap-2">
                  {selectedBooking.status === "Pending" && (
                    <>
                      <Button size="sm" className="btn-gold text-xs" onClick={() => updateStatus(selectedBooking.id, "Approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs border-destructive text-destructive hover:bg-destructive/10" onClick={() => updateStatus(selectedBooking.id, "Rejected")}>
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === "Approved" && (
                    <Button size="sm" variant="outline" className="text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateStatus(selectedBooking.id, "Completed")}>
                      Mark Completed
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setSelectedBooking(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}