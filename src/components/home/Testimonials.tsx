import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jean-Pierre Habimana",
    role: "Event Organizer",
    text: "Kundwa IB Group transformed our corporate event into an unforgettable experience. The sound and lighting were world-class!",
    rating: 5,
  },
  {
    name: "Amina Uwimana",
    role: "Wedding Planner",
    text: "Professional team, stunning stage designs, and flawless execution. They're our go-to for every premium event in Kigali.",
    rating: 5,
  },
  {
    name: "Patrick Mugisha",
    role: "Festival Director",
    text: "The equipment quality and technical expertise are unmatched in the region. True pioneers of event production in Africa.",
    rating: 5,
  },
];

const partners = ["MTN Rwanda", "BK Group", "RwandAir", "Airtel", "KT Radio", "Visit Rwanda"];

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">What Our Clients Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="card-premium p-6 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <Quote className="h-8 w-8 text-secondary/30 mb-3" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="font-semibold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium">Trusted By Leading Brands</p>
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((p) => (
              <span key={p} className="text-muted-foreground/50 font-bold text-lg hover:text-foreground transition-colors">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
