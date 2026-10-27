import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  Wrench, 
  Briefcase, 
  Ticket, 
  Mail, 
  Check, 
  ChevronRight, 
  Clock, 
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NotificationItem {
  id: string;
  type: "rental" | "service" | "ticket" | "contact";
  title: string;
  description: string;
  customer: string;
  time: string;
  timestamp: number;
  targetTab: string;
  status?: string;
}

interface AdminNotificationBellProps {
  onNavigateTab: (tabId: string) => void;
}

export function AdminNotificationBell({ onNavigateTab }: AdminNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "rental" | "service" | "ticket" | "contact">("all");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_read_notifications");
      if (saved) {
        setReadIds(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveReadIds = (newSet: Set<string>) => {
    setReadIds(newSet);
    try {
      localStorage.setItem("admin_read_notifications", JSON.stringify(Array.from(newSet)));
    } catch {
      // ignore
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recently";
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [bookingsRes, ticketsRes, contactsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, booking_type, service_name, equipment_name, customer_name, status, created_at, amount")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("tickets")
          .select("id, ticket_code, ticket_type, customer_name, quantity, total_price, purchased_at, status")
          .order("purchased_at", { ascending: false })
          .limit(15),
        supabase
          .from("contact_submissions")
          .select("id, name, email, subject, message, status, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      const items: NotificationItem[] = [];

      // 1. Process Bookings (Equipment rentals & Service inquiries)
      if (bookingsRes.data) {
        bookingsRes.data.forEach((b: any) => {
          const isRental = b.booking_type === "equipment";
          items.push({
            id: `booking-${b.id}`,
            type: isRental ? "rental" : "service",
            title: isRental 
              ? `New Rental: ${b.equipment_name || "Equipment Gear"}` 
              : `Service Request: ${b.service_name || "Event Production"}`,
            description: b.amount ? `${parseFloat(b.amount).toLocaleString()} RWF` : (isRental ? "Equipment reservation" : "Production inquiry"),
            customer: b.customer_name || "Client",
            time: formatRelativeTime(b.created_at),
            timestamp: new Date(b.created_at || Date.now()).getTime(),
            targetTab: "bookings",
            status: b.status || "Pending",
          });
        });
      }

      // 2. Process Tickets
      if (ticketsRes.data) {
        ticketsRes.data.forEach((t: any) => {
          items.push({
            id: `ticket-${t.id}`,
            type: "ticket",
            title: `Ticket Purchased: ${t.ticket_type || "Pass"}`,
            description: `${t.quantity || 1} ticket(s) • ${(parseFloat(t.total_price) || 0).toLocaleString()} RWF`,
            customer: t.customer_name || "Attendee",
            time: formatRelativeTime(t.purchased_at),
            timestamp: new Date(t.purchased_at || Date.now()).getTime(),
            targetTab: "events",
            status: t.status || "Active",
          });
        });
      }

      // 3. Process Contact Inquiries
      if (contactsRes.data) {
        contactsRes.data.forEach((c: any) => {
          items.push({
            id: `contact-${c.id}`,
            type: "contact",
            title: `New Message: ${c.subject || "General Inquiry"}`,
            description: (c.message || "").slice(0, 75) + (c.message?.length > 75 ? "..." : ""),
            customer: c.name || c.email || "Client",
            time: formatRelativeTime(c.created_at),
            timestamp: new Date(c.created_at || Date.now()).getTime(),
            targetTab: "contacts",
            status: c.status || "New",
          });
        });
      }

      // Sort by newest timestamp
      items.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(items);
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // 45s refresh
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    saveReadIds(allIds);
  };

  const handleItemClick = (item: NotificationItem) => {
    // Mark this item as read
    const next = new Set(readIds);
    next.add(item.id);
    saveReadIds(next);

    // Close and navigate to the relevant tab
    setIsOpen(false);
    onNavigateTab(item.targetTab);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "rental":
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case "service":
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "ticket":
        return <Ticket className="w-4 h-4 text-emerald-500" />;
      case "contact":
        return <Mail className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className={`relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all border border-border/60 ${
          isOpen ? "bg-muted text-foreground ring-2 ring-primary/20" : ""
        }`}
        title="Live System Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] rounded-2xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Live Notifications
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-muted-foreground">Inquiries, rentals, tickets & messages</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 border-b border-border/40 flex items-center gap-1 overflow-x-auto scrollbar-none bg-muted/10 text-[11px]">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("rental")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === "rental" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Rentals
            </button>
            <button
              onClick={() => setActiveFilter("service")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === "service" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveFilter("ticket")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === "ticket" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setActiveFilter("contact")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === "contact" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Messages
            </button>
          </div>

          {/* List of items */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40 scrollbar-thin">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground">No new activities matching this category.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !readIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/60 group relative ${
                      isUnread ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    {isUnread && (
                      <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div className="p-2 rounded-xl bg-background border border-border/60 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {getIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs leading-snug truncate ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {item.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        <span className="font-semibold text-foreground/90">{item.customer}</span> • {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 pt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {item.status || "Active"}
                        </span>

                        <span className="text-[10px] font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          View details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-muted/30 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Total activities: {notifications.length}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateTab("bookings");
              }}
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              All bookings <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
