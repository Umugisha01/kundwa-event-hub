import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

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

  // Provide fallback links if none exist in the database yet
  const facebook = settings?.facebook_url || "https://facebook.com";
  const instagram = settings?.instagram_url || "https://instagram.com";
  const twitter = settings?.twitter_url || "https://twitter.com";
  const youtube = settings?.youtube_url || "https://youtube.com";

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/kundwa.png"
                alt="Kundwa Sound Lighting System logo"
                className="h-16 w-auto object-contain"
                style={{
                  filter: "invert(1) brightness(1.5)",
                  mixBlendMode: "screen",
                }}
              />
              <span className="font-heading font-bold text-lg">
                Kundwa <span className="text-secondary">IB</span> Group
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Africa's premier event production and management company. Creating unforgettable experiences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Services", "Rentals", "Events", "Contact"].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="block text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>Sound Systems</p>
              <p>Lighting Design</p>
              <p>Stage Production</p>
              <p>Event Management</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-primary-foreground/70 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary flex-shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-secondary transition-colors">
                  {email}
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 mt-4">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground rounded-full transition-all duration-300 transform hover:-translate-y-1"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground rounded-full transition-all duration-300 transform hover:-translate-y-1"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground rounded-full transition-all duration-300 transform hover:-translate-y-1"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground rounded-full transition-all duration-300 transform hover:-translate-y-1"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          {copyright}
        </div>
      </div>
    </footer>
  );
}

