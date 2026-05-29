import { Users, Calendar, Award, MapPin } from "lucide-react";

const stats = [
  { icon: Calendar, value: "500+", label: "Events Produced", color: "from-secondary/20 to-secondary/5" },
  { icon: Users, value: "1M+", label: "Attendees Served", color: "from-primary/25 to-primary/5" },
  { icon: Award, value: "10+", label: "Years Experience", color: "from-secondary/20 to-secondary/5" },
  { icon: MapPin, value: "15+", label: "Countries", color: "from-primary/25 to-primary/5" },
];

export function StatsSection() {
  return (
    <section className="relative -mt-20 z-20 px-4 sm:px-6 lg:px-8 pb-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 text-center
                         hover:-translate-y-1 hover:border-secondary/30 transition-all duration-400 animate-fade-in"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: "linear-gradient(135deg, hsl(220 50% 12% / 0.9), hsl(220 50% 8% / 0.95))",
                boxShadow: "0 8px 32px rgba(10, 20, 40, 0.5), inset 0 1px 0 rgba(240, 245, 255, 0.08)",
              }}
            >
              {/* gradient bg blob */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <stat.icon className="relative h-7 w-7 text-secondary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="relative text-3xl md:text-4xl font-black text-white tracking-tight leading-none mb-1">
                {stat.value}
              </p>
              <p className="relative text-xs text-white/50 font-medium tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
