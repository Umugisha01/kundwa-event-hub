import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portfolioProjects } from "@/data/portfolio";
import { supabase } from "@/integrations/supabase/client";

export function PortfolioPreview() {
  const [projects, setProjects] = useState<any[]>(portfolioProjects);

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

  return (
    <section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Recent Projects
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore our portfolio of successful events featuring professional production, 
            sound engineering, and creative stage design.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              to="/portfolio"
              className="group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden bg-gray-200 dark:bg-slate-700">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-6">
                  <div>
                    <p className="text-white text-lg font-semibold mb-2">{project.title}</p>
                    <div className="flex items-center gap-2 text-white">
                      {project.videoUrl && (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-sm">Video Available</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6 bg-white dark:bg-slate-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition">
                  {project.title}
                </h3>
                <p className="text-sm text-primary font-semibold mb-3">{project.category}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{project.date}</span>
                  {project.client && <span className="font-medium">{project.client}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Interested in seeing more of our work?
          </p>
          <Link to="/portfolio">
            <Button size="lg" className="gap-2">
              View Full Portfolio
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
