import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaPlay } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { portfolioProjects } from "@/data/portfolio";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

export function PortfolioPreview() {
  const [projects, setProjects] = useState<any[]>(portfolioProjects);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
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
            thumbnail: p.thumbnail,
            images: p.images || [],
            videoUrl: p.video_url,
            date: p.date,
            client: p.client
          }));
          setProjects(mapped);
        }
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
