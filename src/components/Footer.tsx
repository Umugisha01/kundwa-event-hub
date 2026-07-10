import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMapPin, FaPhone, FaEnvelope, FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaRightToBracket } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function Footer() {
  const [settings, setSettings] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from("footer_settings")
      .select("*")
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings(data);
        }
      });
  }, []);

  const email = settings?.contact_email || "info@kundwaib.com";
  const phone = settings?.contact_phone || "+250 788 000 000";
  const address = settings?.contact_address || "Kigali, Rwanda";
  const copyright = settings?.copyright_text || `© ${new Date().getFullYear()} Kundwa IB Group. All rights reserved.`;

  const facebook = settings?.facebook_url || "https://facebook.com";
  const instagram = settings?.instagram_url || "https://instagram.com";
  const twitter = settings?.twitter_url || "https://twitter.com";
  const youtube = settings?.youtube_url || "https://youtube.com";

  // Persistent Premium Dark Background style (always dark with glowing diagonal ray)
  const footerStyle = {
    position: "relative" as const,
    overflow: "hidden" as const,
    background: "linear-gradient(115deg, transparent 32%, rgba(56, 189, 248, 0.12) 42%, rgba(56, 189, 248, 0.22) 50%, rgba(56, 189, 248, 0.12) 58%, transparent 68%), linear-gradient(135deg, #050b1a 0%, #0d1b3e 100%)",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  };

  return (
    <footer style={footerStyle} className="text-white">
      {/* Ambient background glow highlights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Logo, Tagline & Action Buttons */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/kundwa.png"
                alt="Kundwa Logo"
                className="h-16 w-auto object-contain"
                style={{
                  filter: "invert(1) brightness(1.5)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Creating unforgettable experiences with world-class sound, lighting, and stage production.
            </p>
            {/* CTA Buy Ticket & Login Buttons (Moved here) */}
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              <Link to="/events">
                <button
                  className="w-full relative overflow-hidden py-2.5 px-4 rounded-xl text-xs font-black tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-1.5 shadow-md border"
                  style={{
                    background: "linear-gradient(135deg, hsl(220, 60%, 15%), hsl(220, 55%, 22%))",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                  }}
                >
                  🎟 Buy Ticket
                </button>
              </Link>
              
              {!user && (
                <Link to="/login">
                  <button
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    <FaRightToBracket className="h-3.5 w-3.5 text-secondary" />
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
            <div className="space-y-3">
              {["Home", "Services", "Rentals", "Events", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="block text-sm text-slate-300 hover:text-secondary transition-colors font-medium"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Services</h4>
            <div className="space-y-3 text-sm text-slate-300 font-medium">
              <p className="hover:text-secondary transition-colors cursor-pointer">Sound Systems</p>
              <p className="hover:text-secondary transition-colors cursor-pointer">Lighting Design</p>
              <p className="hover:text-secondary transition-colors cursor-pointer">Stage Production</p>
              <p className="hover:text-secondary transition-colors cursor-pointer">Event Management</p>
            </div>
          </div>

          {/* Column 4: Contact Info & Social Media Buttons */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs font-heading">Contact Info</h4>
            <div className="space-y-3.5 text-sm text-slate-300 font-semibold mb-6">
              <div className="flex items-center gap-3">
                <FaMapPin className="h-4 w-4 text-secondary shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="h-4 w-4 text-secondary shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="h-4 w-4 text-secondary shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-secondary transition-colors">
                  {email}
                </a>
              </div>
            </div>

            {/* Social Media Links (Minimalist, No background) (Moved here) */}
            <div className="flex items-center gap-4.5 mt-6">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-secondary transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-secondary transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-secondary transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                  aria-label="Twitter"
                >
                  <FaXTwitter />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-secondary transition-all duration-300 transform hover:-translate-y-0.5 text-lg"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal links line */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <span>{copyright}</span>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <span className="text-white/10 font-light">|</span>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
