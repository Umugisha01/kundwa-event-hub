import React, { useState } from "react";
import { FaWhatsapp, FaPhone } from "react-icons/fa6";
import { MessageSquare, X } from "lucide-react";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "+250 784 289 407";
  const cleanPhone = "250784289407";

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none"
      style={{
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
      }}
    >
      {/* Quick popup tooltip/card */}
      {isOpen && (
        <div className="w-72 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-foreground">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="py-3">
            <h4 className="font-bold text-sm text-foreground">Need help or a quick quote?</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Reach our production team directly via WhatsApp or phone call.
            </p>
            <div className="mt-2 text-xs font-mono font-bold text-secondary">
              {phoneNumber}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello Kundwa IB Group, I'd like to inquire about your event production services.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              <FaWhatsapp className="h-4 w-4" /> Start WhatsApp Chat
            </a>
            <a
              href={`tel:+${cleanPhone}`}
              className="w-full py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-border/30"
            >
              <FaPhone className="h-3 w-3 text-secondary" /> Call {phoneNumber}
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact via WhatsApp"
        className="group relative flex items-center gap-2.5 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/30 cursor-pointer"
      >
        <FaWhatsapp className="h-6 w-6 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          WhatsApp Us
        </span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </button>
    </div>
  );
}
