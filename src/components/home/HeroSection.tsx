import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ticket, Wrench, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-event.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Concert event by Kundwa IB Group" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-sm font-medium">Africa's Premier Event Company</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Creating{" "}
            <span className="text-secondary">Unforgettable</span>{" "}
            Experiences
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            From world-class sound systems to breathtaking stage designs, we bring your vision to life. Event production, management, and equipment rental — all in one place.
          </p>

          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/services">
              <Button className="btn-gold gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Book Service
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="gap-2 text-base border-secondary/50 text-primary-foreground bg-secondary/15 backdrop-blur-sm hover:bg-secondary/30 px-6 py-3">
                <Ticket className="h-4 w-4" />
                Buy Ticket
              </Button>
            </Link>
            <Link to="/rentals">
              <Button variant="outline" className="gap-2 text-base border-secondary/50 text-primary-foreground bg-secondary/15 backdrop-blur-sm hover:bg-secondary/30 px-6 py-3">
                <Wrench className="h-4 w-4" />
                Rent Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
