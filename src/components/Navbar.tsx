import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kundwa-logo.png";

const navLinks = [
  { to: "/", label: "Home", labelRw: "Ahabanza" },
  { to: "/services", label: "Services", labelRw: "Serivisi" },
  { to: "/rentals", label: "Rentals", labelRw: "Gukodesha" },
  { to: "/events", label: "Events", labelRw: "Ibirori" },
  { to: "/dashboard", label: "Dashboard", labelRw: "Ikibaho" },
  { to: "/contact", label: "Contact", labelRw: "Twandikire" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<"en" | "rw">("en");
  const location = useLocation();

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const toggleLang = () => setLang(lang === "en" ? "rw" : "en");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Kundwa Sound Lighting System logo"
              className="h-10 md:h-12 w-auto object-contain dark:brightness-0 dark:invert"
            />
            <span className="font-heading font-bold text-base md:text-lg text-foreground hidden sm:inline">
              Kundwa <span className="text-secondary">IB</span> Group
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                {lang === "en" ? link.label : link.labelRw}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLang} className="text-foreground/70">
              <Globe className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="text-foreground/70">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/events">
              <Button className="btn-gold text-sm py-2 px-4">
                {lang === "en" ? "Buy Ticket" : "Gura Itike"}
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLang} className="text-foreground/70">
              <Globe className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="text-foreground/70">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                {lang === "en" ? link.label : link.labelRw}
              </Link>
            ))}
            <Link to="/events" onClick={() => setIsOpen(false)}>
              <Button className="btn-gold w-full mt-2 text-sm py-2">
                {lang === "en" ? "Buy Ticket" : "Gura Itike"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
