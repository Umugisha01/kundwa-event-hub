import React from "react";
import { X, ChevronRight, Download, Calendar as CalendarIcon } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    description?: string;
    date: string;
    end_date?: string;
    location?: string;
    venue?: string;
    organizer?: string;
  };
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null;

  const startDate = new Date(event.date || Date.now());
  const endDate = event.end_date
    ? new Date(event.end_date)
    : new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours fallback

  const formatUTC = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
  };

  const startFormatted = formatUTC(startDate);
  const endFormatted = formatUTC(endDate);

  const fullLocation = [event.venue, event.location].filter(Boolean).join(", ") || "Kigali, Rwanda";
  const eventDetails = `${event.description || event.title}\n\nOrganizer: ${event.organizer || "Kundwa IB Event Hub"}\nVenue: ${fullLocation}`;

  // 1. Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(
    fullLocation
  )}`;

  // 2. Outlook Calendar URL
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
    event.title
  )}&startdt=${encodeURIComponent(startDate.toISOString())}&enddt=${encodeURIComponent(
    endDate.toISOString()
  )}&body=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(fullLocation)}`;

  // 3. Yahoo Calendar URL
  const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(
    event.title
  )}&st=${startFormatted.slice(0, 15)}Z&et=${endFormatted.slice(0, 15)}Z&desc=${encodeURIComponent(
    eventDetails
  )}&in_loc=${encodeURIComponent(fullLocation)}`;

  // 4 & 5. ICS Download for Apple Calendar and ICS Export
  const handleDownloadICS = (calendarName: string) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kundwa IB Group//Event Hub//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${Math.random().toString(36).substring(2, 9)}@kundwaib.com`,
      `DTSTAMP:${formatUTC(new Date())}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${event.title.replace(/\n/g, " ")}`,
      `DESCRIPTION:${eventDetails.replace(/\n/g, "\\n")}`,
      `LOCATION:${fullLocation.replace(/\n/g, " ")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calendarOptions = [
    {
      id: "google",
      name: "GOOGLE CALENDAR",
      icon: (
        <div className="w-9 h-9 rounded-lg border border-border/80 bg-background flex flex-col items-center justify-center p-1 font-sans text-center shadow-xs">
          <span className="text-[9px] uppercase font-bold text-red-500 leading-none">
            {startDate.toLocaleString("en-US", { month: "short" })}
          </span>
          <span className="text-sm font-extrabold text-foreground leading-none mt-0.5">
            {startDate.getDate()}
          </span>
        </div>
      ),
      action: () => window.open(googleCalendarUrl, "_blank", "noopener,noreferrer"),
    },
    {
      id: "outlook",
      name: "OUTLOOK CALENDAR",
      icon: (
        <div className="w-9 h-9 rounded-lg bg-[#0078D4]/10 text-[#0078D4] border border-[#0078D4]/30 flex items-center justify-center shadow-xs">
          <span className="font-extrabold text-base">O</span>
        </div>
      ),
      action: () => window.open(outlookCalendarUrl, "_blank", "noopener,noreferrer"),
    },
    {
      id: "apple",
      name: "APPLE CALENDAR",
      icon: (
        <div className="w-9 h-9 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center shadow-xs">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-7.96-12.24-14.64-5.92-8.87-10.45-18.77-13.57-29.7-3.12-10.93-4.68-21.2-4.68-30.8 0-14.67 3.82-26.68 11.45-36.03 7.64-9.35 17.2-14.12 28.69-14.32 4.92 0 10.37 1.25 16.36 3.75 5.99 2.5 9.87 3.85 11.64 4.04 1.45-.19 5.48-1.54 12.09-4.04 6.61-2.5 12.18-3.65 16.71-3.45 12.87.64 23.3 5.43 31.31 14.37-11.2 6.77-16.65 16.29-16.36 28.56.32 9.68 4.1 17.8 11.34 24.37 4.92 4.48 10.59 7.42 17.02 8.82-2.3 6.79-5.17 13.43-8.62 19.92zM119.22 33.72c0-7.39 2.67-14.28 8.01-20.67 5.34-6.39 12.1-10.74 20.28-13.05.32 1.07.48 2.19.48 3.36 0 7.39-2.77 14.39-8.31 21-5.54 6.61-12.44 10.87-20.7 12.77-.21-1.17-.32-2.3-.32-3.41z" />
          </svg>
        </div>
      ),
      action: () => handleDownloadICS("Apple"),
    },
    {
      id: "yahoo",
      name: "YAHOO CALENDAR",
      icon: (
        <div className="w-9 h-9 rounded-lg bg-[#6001d2]/10 text-[#6001d2] border border-[#6001d2]/30 flex items-center justify-center font-black text-lg shadow-xs">
          Y!
        </div>
      ),
      action: () => window.open(yahooCalendarUrl, "_blank", "noopener,noreferrer"),
    },
    {
      id: "ics",
      name: "ICS EXPORT",
      icon: (
        <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 flex items-center justify-center shadow-xs">
          <Download className="w-4 h-4" />
        </div>
      ),
      action: () => handleDownloadICS("Generic"),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-background text-foreground rounded-2xl shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Add to Calendar</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="divide-y divide-border">
          {calendarOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                opt.action();
                onClose();
              }}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {opt.icon}
                <span className="font-bold text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                  {opt.name}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CalendarModal;
