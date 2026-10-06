import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaPlay } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FolderKanban, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import heroImg from "@/assets/hero-event.jpg";

export function PortfolioPreview() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    setLoading(true);
    supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            description: p.description,
            thumbnail: resolveMediaUrl(p.thumbnail, heroImg),
            images: p.images || [],
            videoUrl: p.video_url ? resolveMediaUrl(p.video_url) : undefined,
            date: p.date,
            client: p.client
          }));
          setProjects(mapped);
        } else {
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  const featuredProjects = projects.slice(0, 3);

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
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.25em]">Our Work</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
            Our Recent <span className="text-secondary">Projects</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base leading-relaxed">
            Explore our portfolio of successful events featuring professional production, 
            sound engineering, and creative stage design.
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading project showcase...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="max-w-xl mx-auto py-12 px-6 text-center rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md mb-12">
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Our project highlights and stage production reels are currently being curated for this showcase. Explore our services or reach out directly to request our full client portfolio deck.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/services">
                <Button className="btn-gold gap-1.5">
                  Explore Services <FaArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {featuredProjects.map((project) => (
            <Link
              key={project.id}
              to="/portfolio"
              className="group cursor-pointer overflow-hidden rounded-[24px] border backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between relative w-full md:max-w-[380px]"
              style={{
                background: cardBg,
                border: cardBorder,
                boxShadow: cardShadow,
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

              {/* Thumbnail Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-muted/20">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    {project.category}
                  </span>
                  {project.videoUrl && (
                    <div className="flex items-center gap-1 bg-secondary/20 border border-secondary/30 backdrop-blur-sm px-2.5 py-1 rounded-full text-secondary">
                      <FaPlay className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">Video</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6 flex-1 flex flex-col justify-between pl-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-secondary transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pt-4 border-t border-border/40">
                  <span>{project.date}</span>
                  {project.client && <span className="text-foreground/75 font-bold">{project.client}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6 text-base font-semibold">
            Interested in seeing more of our work?
          </p>
          <Link to="/portfolio">
            <Button className="btn-gold py-3 px-8 text-base shadow-lg shadow-secondary/20 font-bold rounded-xl gap-2">
              View Full Portfolio
              <FaArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
