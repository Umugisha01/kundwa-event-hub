import { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

const defaultTestimonials = [
  {
    client_name: "Jean-Pierre Habimana, Event Organizer",
    message: "Kundwa IB Group transformed our corporate event into an unforgettable experience. The sound and lighting were world-class!",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    client_name: "Amina Uwimana, Wedding Planner",
    message: "Professional team, stunning stage designs, and flawless execution. They're our go-to for every premium event in Kigali.",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    client_name: "Patrick Mugisha, Festival Director",
    message: "The equipment quality and technical expertise are unmatched in the region. True pioneers of event production in Africa.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  }
];

const defaultBrands = [
  { name: "MTN Rwanda", logo_url: "" },
  { name: "BK Group", logo_url: "" },
  { name: "RwandAir", logo_url: "" },
  { name: "Airtel", logo_url: "" },
  { name: "KT Radio", logo_url: "" },
  { name: "Visit Rwanda", logo_url: "" }
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);
  const [brands, setBrands] = useState<any[]>(defaultBrands);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setTestimonials(data);
        }
      });

    supabase
      .from("trusted_brands")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setBrands(data);
        }
      });
  }, []);

  const cardBorder = isDark
    ? `1px solid rgba(255, 255, 255, 0.08)`
    : `1px solid rgba(0, 0, 0, 0.06)`;

  const cardShadow = isDark
    ? `0 12px 40px rgba(0, 0, 0, 0.4)`
    : `0 8px 30px rgba(15, 23, 42, 0.04)`;

  const cardBg = isDark
    ? "rgba(10, 15, 30, 0.85)"
    : "rgba(255, 255, 255, 0.85)";

  return (
    <section className="py-20 md:py-28 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.25em]">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
            What Our <span className="text-secondary">Clients Say</span>
          </h2>
        </div>

        {/* Testimonials Flex Container */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {testimonials.slice(0, 3).map((t, i) => (
            <div
              key={t.id || i}
              className="group relative overflow-hidden rounded-[24px] border backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between p-8 animate-fade-in w-full md:max-w-[380px] min-h-[320px]"
              style={{
                background: cardBg,
                border: cardBorder,
                boxShadow: cardShadow,
                animationDelay: `${i * 0.15}s`
              }}
            >
              {/* Vertical Accent Bar */}
              <div
                className="absolute left-0 top-8 w-[4px] h-10 rounded-r-full transition-all duration-500 group-hover:h-16 z-20"
                style={{
                  background: "hsl(var(--secondary))",
                  boxShadow: "0 0 12px hsl(var(--secondary))",
                }}
              />

              <div className="pl-2">
                <FaQuoteLeft className="h-6 w-6 text-secondary/30 mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                  "{t.message}"
                </p>
              </div>

              <div className="pl-2 pt-4 border-t border-border/40">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <FaStar key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                </div>
                <div className="flex items-center gap-3.5">
                  {t.image_url && (
                    <img
                      src={t.image_url}
                      alt={t.client_name}
                      className="h-11 w-11 rounded-full object-cover border border-border/50 shadow-sm"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="font-bold text-foreground text-sm leading-tight">
                      {t.client_name.split(",")[0]}
                    </p>
                    {t.client_name.includes(",") && (
                      <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                        {t.client_name.split(",")[1].trim()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center pt-8 border-t border-border/20">
          <p className="text-xs font-bold text-muted-foreground/60 mb-8 uppercase tracking-[0.2em]">
            Trusted By Leading Brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {brands.map((b, i) => (
              <span key={b.id || i} className="transition-transform duration-300 hover:scale-105">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="h-8 md:h-10 object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-muted-foreground/40 font-extrabold text-base tracking-wider hover:text-secondary transition-colors duration-300">
                    {b.name}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
