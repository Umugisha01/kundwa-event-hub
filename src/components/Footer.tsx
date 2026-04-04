import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">K</span>
              </div>
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
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>+250 788 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>info@kundwaib.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Kundwa IB Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
