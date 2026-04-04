import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Ticket, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import concertImg from "@/assets/event-concert.jpg";
import corporateImg from "@/assets/event-corporate.jpg";
import weddingImg from "@/assets/event-wedding.jpg";
import heroImg from "@/assets/hero-event.jpg";

const allEvents = [
  { title: "Kigali Music Festival 2026", date: "May 15, 2026", location: "BK Arena, Kigali", price: "15,000", image: concertImg, tag: "Concert", seats: 5000 },
  { title: "Rwanda Tech Summit", date: "June 20, 2026", location: "Kigali Convention Centre", price: "50,000", image: corporateImg, tag: "Conference", seats: 800 },
  { title: "Gala Night Experience", date: "July 8, 2026", location: "Radisson Blu, Kigali", price: "80,000", image: weddingImg, tag: "Gala", seats: 300 },
  { title: "Amahoro Festival", date: "Aug 12, 2026", location: "Amahoro Stadium, Kigali", price: "10,000", image: heroImg, tag: "Festival", seats: 20000 },
  { title: "Corporate Gala Dinner", date: "Sep 5, 2026", location: "Marriott Hotel, Kigali", price: "100,000", image: weddingImg, tag: "Corporate", seats: 200 },
  { title: "DJ Night Live", date: "Oct 18, 2026", location: "Kigali Rooftop Lounge", price: "20,000", image: concertImg, tag: "Concert", seats: 500 },
];

const EventsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = allEvents.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Events</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Upcoming Events</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Discover and book tickets for the best events across Rwanda.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, i) => (
              <div key={i} className="card-premium overflow-hidden group">
                <div className="relative h-52 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                  <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">{event.tag}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-foreground text-lg mb-3">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-secondary" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-secondary" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-secondary" /> {event.seats.toLocaleString()} seats
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">From {event.price} RWF</span>
                    <Button size="sm" className="btn-gold text-xs py-1.5 px-3 gap-1">
                      <Ticket className="h-3 w-3" /> Buy Ticket
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
