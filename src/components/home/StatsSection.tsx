import { Users, Calendar, Award, MapPin } from "lucide-react";

const stats = [
  { icon: Calendar, value: "500+", label: "Events Produced" },
  { icon: Users, value: "1M+", label: "Attendees Served" },
  { icon: Award, value: "10+", label: "Years Experience" },
  { icon: MapPin, value: "15+", label: "Countries" },
];

export function StatsSection() {
  return (
    <section className="relative -mt-16 z-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="card-premium p-6 text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <stat.icon className="h-6 w-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
