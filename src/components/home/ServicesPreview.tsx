import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCircleCheck, FaVolumeHigh, FaCalendarDays, FaUsers, FaShieldHalved, FaGear, FaHeadphones } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

const categoryData = [
  {
    title: "Event Production",
    description: "Sound systems, lighting, and stage design — everything for a flawless show.",
  },
  {
    title: "Event Management",
    description: "Branding, advertisement, and ticketing to fill your venue and build your brand.",
  },
  {
    title: "Corporate Events",
    description: "Professional planning and execution for conferences, galas, and team-building.",
  }
];

const defaultCategoryItems: Record<string, string[]> = {
  "Event Production": ["Sound Systems & Line Arrays", "Stage Lighting & Trussing", "LED Video Walls", "Stage Setup & Rigging"],
  "Event Management": ["Artist Booking & Lineup", "Ticketing & Access Control", "Branding & Media Coverage", "Crowd & Venue Safety"],
  "Corporate Events": ["Conference AV & Livestreaming", "Keynote Stage Setup", "Gala Dinners & Award Ceremonies", "Simultaneous Interpretation"],
};

export function ServicesPreview() {
  const [mainServices, setMainServices] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    Promise.all([
      supabase.from("main_services").select("*").order("order"),
      supabase.from("services").select("*")
    ]).then(([msRes, sRes]) => {
      if (msRes.data && msRes.data.length > 0) {
        setMainServices(msRes.data);
      }
      if (sRes.data && sRes.data.length > 0) {
        setDbServices(sRes.data);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const effectiveCategories = mainServices.length > 0
    ? mainServices.map(m => {
        const matching = dbServices.filter(s => s.category === m.title).map(s => s.name);
        return {
          title: m.title,
          description: m.description || "Comprehensive event solutions.",
          items: matching.length > 0 ? matching : (defaultCategoryItems[m.title] || ["Professional Equipment", "Certified Engineers", "Setup & Teardown"])
        };
      })
    : categoryData.map((cat) => {
        const matching = dbServices.filter((s) => s.category === cat.title).map((s) => s.name);
        return {
          title: cat.title,
          description: cat.description,
          items: matching.length > 0 ? matching : (defaultCategoryItems[cat.title] || ["Professional Equipment", "Certified Engineers", "Setup & Teardown"])
        };
      });

  const categories = effectiveCategories;

  const getCategoryIcon = (title: string) => {
    switch (title) {
      case "Event Production":
        return <FaVolumeHigh className="text-secondary text-[32px] shrink-0" />;
      case "Event Management":
        return <FaCalendarDays className="text-secondary text-[32px] shrink-0" />;
      case "Corporate Events":
        return <FaUsers className="text-secondary text-[32px] shrink-0" />;
      default:
        return <FaGear className="text-secondary text-[32px] shrink-0" />;
    }
  };

  const navBorder = isDark
    ? `1px solid rgba(255, 255, 255, 0.08)`
    : `1px solid rgba(0, 0, 0, 0.06)`;

  const navShadow = isDark
    ? `0 12px 40px rgba(0, 0, 0, 0.4)`
    : `0 8px 30px rgba(15, 23, 42, 0.04)`;

  const navBg = isDark
    ? "rgba(10, 15, 30, 0.85)"
    : "rgba(255, 255, 255, 0.85)";

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.25em]">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
            Our <span className="text-secondary">Services</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed">
            End-to-end event solutions tailored for Africa's growing entertainment industry.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {categories.filter((cat) => cat.items.length > 0).map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
                className="relative rounded-[24px] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group border backdrop-blur-md overflow-hidden w-full md:max-w-[380px]"
                style={{
                  background: navBg,
                  border: navBorder,
                  boxShadow: navShadow,
                }}
              >
                {/* Vertical Accent Bar (Glowing Left Border Accent) */}
                <div
                  className="absolute left-0 top-8 w-[4px] h-10 rounded-r-full transition-all duration-500 group-hover:h-16"
                  style={{
                    background: "hsl(var(--secondary))",
                    boxShadow: "0 0 12px hsl(var(--secondary))",
                  }}
                />

                <div className="pl-2">
                  {/* Category Icon - Background Removed */}
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center min-h-[40px]">
                    {getCategoryIcon(cat.title)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-secondary transition-colors duration-300">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="h-px w-full bg-border/40 my-6" />

                  {/* Checklist */}
                  <ul className="space-y-3.5 mb-8">
                    {cat.items.map((label, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <FaCircleCheck className="h-[16px] w-[16px] text-secondary shrink-0" />
                        <span className="text-sm font-semibold text-foreground/80 leading-none">{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learn More Link */}
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:gap-2.5 transition-all mt-auto pl-2"
                >
                  Learn More <FaArrowRight className="h-3.5 w-3.5 animate-pulse" />
                </Link>
              </motion.div>
            ))}
          </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/services">
            <Button className="btn-gold py-3 px-8 text-base shadow-lg shadow-secondary/20 font-bold rounded-xl gap-2">
              View All Services <FaArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Trust Badges Banner - Backgrounds Removed from Icons */}
        <div
          className="mt-16 rounded-[28px] border p-6 md:p-8 flex flex-col md:flex-row items-center justify-around gap-6 backdrop-blur-md"
          style={{
            background: navBg,
            border: navBorder,
            boxShadow: navShadow,
          }}
        >
          {/* Badge 1 */}
          <div className="flex items-center gap-4">
            <div className="text-secondary flex items-center justify-center">
              <FaShieldHalved className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-bold text-foreground">Professional & Reliable</span>
          </div>

          <div className="h-8 w-px bg-border/50 hidden md:block" />

          {/* Badge 2 */}
          <div className="flex items-center gap-4">
            <div className="text-secondary flex items-center justify-center">
              <FaUsers className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-bold text-foreground">Experienced Team</span>
          </div>

          <div className="h-8 w-px bg-border/50 hidden md:block" />

          {/* Badge 3 */}
          <div className="flex items-center gap-4">
            <div className="text-secondary flex items-center justify-center">
              <FaGear className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-bold text-foreground">Quality Equipment</span>
          </div>

          <div className="h-8 w-px bg-border/50 hidden md:block" />

          {/* Badge 4 */}
          <div className="flex items-center gap-4">
            <div className="text-secondary flex items-center justify-center">
              <FaHeadphones className="h-6 w-6 text-secondary" />
            </div>
            <span className="text-sm font-bold text-foreground">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
