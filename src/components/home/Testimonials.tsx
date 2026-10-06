import { useEffect, useState } from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa6";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            ...t,
            image_url: resolveMediaUrl(t.image_url)
          }));
          setTestimonials(mapped);
        } else {
          setTestimonials([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setTestimonials([]);
        setLoading(false);
      });

    supabase
      .from("trusted_brands")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((b: any) => ({
            ...b,
            logo_url: resolveMediaUrl(b.logo_url)
          }));
          setBrands(mapped);
        } else {
          setBrands([]);
        }
      })
      .catch(() => {
        setBrands([]);
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

  // Ensure enough items to fill the marquee seamlessly across all screen widths
  const repeatCount = Math.max(2, Math.ceil(10 / Math.max(brands.length, 1)));
  const marqueeBrands = Array.from({ length: repeatCount }).flatMap(() => brands);

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
        {testimonials.length === 0 ? (
          <div className="max-w-xl mx-auto py-10 px-6 text-center rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md mb-16">
            <FaQuoteLeft className="h-8 w-8 text-secondary/30 mx-auto mb-4" />
            <p className="text-foreground/90 font-medium text-base mb-3 leading-relaxed">
              "Delivering world-class audiovisuals, festival staging, and concert productions for Africa's most discerning event organizers and brands."
            </p>
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">
              Kundwa IB Group Production Excellence
            </p>
          </div>
        ) : (
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
        )}

        {/* Trusted Partners - Slow Motion Marquee */}
        {brands.length > 0 && (
          <div className="pt-10 border-t border-border/20">
          <p className="text-center text-xs md:text-sm font-extrabold text-muted-foreground/75 mb-8 uppercase tracking-[0.25em]">
            Trusted Partners
          </p>

          <div className="relative w-full overflow-hidden py-3">
            {/* Cinematic Edge Gradients for Smooth In/Out Fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 md:w-36 z-10 bg-gradient-to-r from-background via-background/85 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 md:w-36 z-10 bg-gradient-to-l from-background via-background/85 to-transparent" />

            {/* Continuous Marquee Track Moving Right to Left */}
            <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused]">
              {/* Set 1 */}
              <div className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14">
                {marqueeBrands.map((b, i) => (
                  <div
                    key={`partner-track-1-${b.id || b.name}-${i}`}
                    className="flex-shrink-0 flex items-center justify-center px-6 py-3.5 rounded-2xl bg-card/60 dark:bg-card/25 border border-border/40 backdrop-blur-md shadow-sm hover:border-secondary/40 hover:bg-card/90 hover:scale-105 transition-all duration-300 group cursor-pointer"
                  >
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="h-8 md:h-10 w-auto max-w-[130px] md:max-w-[160px] object-contain filter grayscale opacity-65 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = "block";
                          }
                        }}
                      />
                    ) : null}
                    <span
                      style={{ display: b.logo_url ? "none" : "block" }}
                      className="text-muted-foreground/70 font-extrabold text-sm md:text-base tracking-wider group-hover:text-secondary transition-colors duration-300 whitespace-nowrap"
                    >
                      {b.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Set 2 (Identical Clone for 100% Seamless Infinite Loop) */}
              <div className="flex items-center gap-8 md:gap-14 pr-8 md:pr-14" aria-hidden="true">
                {marqueeBrands.map((b, i) => (
                  <div
                    key={`partner-track-2-${b.id || b.name}-${i}`}
                    className="flex-shrink-0 flex items-center justify-center px-6 py-3.5 rounded-2xl bg-card/60 dark:bg-card/25 border border-border/40 backdrop-blur-md shadow-sm hover:border-secondary/40 hover:bg-card/90 hover:scale-105 transition-all duration-300 group cursor-pointer"
                  >
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="h-8 md:h-10 w-auto max-w-[130px] md:max-w-[160px] object-contain filter grayscale opacity-65 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = "block";
                          }
                        }}
                      />
                    ) : null}
                    <span
                      style={{ display: b.logo_url ? "none" : "block" }}
                      className="text-muted-foreground/70 font-extrabold text-sm md:text-base tracking-wider group-hover:text-secondary transition-colors duration-300 whitespace-nowrap"
                    >
                      {b.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
