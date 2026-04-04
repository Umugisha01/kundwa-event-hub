import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Ticket } from "lucide-react";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import weddingImg from "@/assets/event-wedding.jpg";

const events = [
  {
    title: "Kigali Music Festival 2026",
    date: "May 15, 2026",
    location: "BK Arena, Kigali",
    price: "15,000 RWF",
    image: concertImg,
    tag: "Concert",
  },
  {
    title: "Rwanda Tech Summit",
    date: "June 20, 2026",
    location: "Kigali Convention Centre",
    price: "50,000 RWF",
    image: corporateImg,
    tag: "Conference",
  },
  {
    title: "Gala Night Experience",
    date: "July 8, 2026",
    location: "Radisson Blu, Kigali",
    price: "80,000 RWF",
    image: weddingImg,
    tag: "Gala",
  },
];

export function FeaturedEvents() {
  return (
    <section className="section-padding bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Upcoming</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Featured Events</h2>
          </div>
          <Link to="/events">
            <Button variant="outline" className="hidden sm:flex">View All Events</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div key={i} className="card-premium overflow-hidden group animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="relative h-52 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {event.tag}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-foreground text-lg mb-3">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-secondary" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-secondary" />
                    {event.location}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">From {event.price}</span>
                  <Link to="/events">
                    <Button size="sm" className="btn-gold text-xs py-1.5 px-3 gap-1">
                      <Ticket className="h-3 w-3" /> Buy Ticket
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
