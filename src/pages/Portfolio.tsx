import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Play, X, FolderKanban, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import heroImg from "@/assets/hero-event.jpg";

const Portfolio = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setFetchError("Unable to retrieve portfolio projects.");
        setProjects([]);
      } else if (data && data.length > 0) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          thumbnail: resolveMediaUrl(p.thumbnail, heroImg),
          images: (p.images && Array.isArray(p.images) ? p.images : []).map((img: string) => resolveMediaUrl(img, heroImg)),
          videoUrl: p.video_url ? resolveMediaUrl(p.video_url) : undefined,
          date: p.date,
          client: p.client
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch {
      setFetchError("Unable to connect to portfolio service.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const project = selectedProject
    ? projects.find((p) => p.id === selectedProject)
    : null;

  const handleNextImage = () => {
    if (project && selectedImageIndex < project.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative text-white pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
        {/* Abstract Geometric Background Design */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Slanted gradient background base */}
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #050814 0%, #0c1730 100%)"
                : "linear-gradient(135deg, #0a1124 0%, #15203d 100%)",
            }}
          />

          {/* Ambient blurred glow layers (Purple top-left, Blue bottom-right) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

          {/* Waves/Flowing Curves (Subtle Opacity SVGs) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] md:opacity-[0.06]" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 C150,20 400,220 800,80 C1100,10 1300,180 1550,120 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-1)" />
            <path d="M-100,200 C300,120 600,320 1000,180 C1300,80 1450,250 1550,220 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-2)" />
            <defs>
              <linearGradient id="bg-wave-gradient-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="bg-wave-gradient-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Abstract Geometric Shapes */}
          <svg className="absolute top-[15%] left-[6%] w-7 h-7 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>
          <svg className="absolute bottom-[20%] left-[8%] w-6 h-6 text-sky-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[18%] left-[48%] w-8 h-8 text-indigo-400/15 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 2.5l9 6.5-3.5 10.5h-11L3 9l9-6.5z" />
          </svg>
          <svg className="absolute top-[25%] right-[8%] w-6 h-6 text-sky-400/25 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[15%] right-[10%] w-6 h-6 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>

          {/* Diagonal slash lines */}
          <svg className="absolute top-[28%] left-[22%] w-16 h-16 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute top-[18%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[12%] left-[16%] w-12 h-12 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[15%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Our Work</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-5">Our Portfolio</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
            Explore our recent projects showcasing professional event production, sound engineering, and stage design.
          </p>
        </div>
      </section>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Portfolio Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm font-semibold">Loading portfolio projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="max-w-xl mx-auto py-16 px-6 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md my-8 shadow-sm">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                {fetchError ? <AlertCircle className="h-8 w-8 text-amber-500" /> : <FolderKanban className="h-8 w-8 text-secondary" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {fetchError ? "Portfolio Service Temporarily Unavailable" : "Portfolio Showcase In Preparation"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                {fetchError
                  ? "We are unable to reach the portfolio database right now. Please verify your connection or contact our team directly."
                  : "We are currently curating and uploading high-definition photo galleries and video reels from our latest productions across East Africa. Reach out to request our full agency credentials deck."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact">
                  <Button className="btn-gold">Request Credentials Deck</Button>
                </Link>
                <Button variant="outline" onClick={() => fetchPortfolio()} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Project Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedProject(project.id);
                          setSelectedImageIndex(0);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white p-3 rounded-full transition"
                        title="View images"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      {project.videoUrl && (
                        <button
                          onClick={() => {
                            setSelectedProject(project.id);
                            setShowVideoModal(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition"
                          title="Watch video"
                        >
                          <Play className="w-6 h-6 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{project.title}</h3>
                      {project.videoUrl && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                          Video
                        </span>
                      )}
                    </div>
                    <p className="text-primary text-sm font-semibold mb-2">
                      {project.category}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-600">
                      <span>{project.date}</span>
                      {project.client && <span>{project.client}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {project && !showVideoModal && (
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white p-2 rounded z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative bg-black">
                <img
                  src={project.images[selectedImageIndex]}
                  alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-cover"
                />

                {/* Navigation Buttons */}
                {project.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={selectedImageIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={selectedImageIndex === project.images.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Project Details */}
              <div className="p-6 text-white dark:text-slate-50">
                <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
                <p className="text-primary font-semibold mb-3">{project.category}</p>
                <p className="text-slate-300 dark:text-slate-400 mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400 dark:text-slate-500">
                  <span>📅 {project.date}</span>
                  {project.client && <span>🏢 {project.client}</span>}
                </div>

                {/* Image Counter */}
                {project.images.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 dark:border-slate-800 text-sm text-slate-400 dark:text-slate-500">
                    Image {selectedImageIndex + 1} of {project.images.length}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {project.images.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {project.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 rounded flex-shrink-0 overflow-hidden border-2 transition ${
                          idx === selectedImageIndex
                            ? "border-primary"
                            : "border-slate-700 dark:border-slate-800 hover:border-slate-600 dark:hover:border-slate-700"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Button */}
                {project.videoUrl && (
                  <Button
                    onClick={() => setShowVideoModal(true)}
                    className="w-full mt-6 bg-red-600 hover:bg-red-700"
                  >
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Watch Video
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Modal */}
      {project && showVideoModal && project.videoUrl && (
        <Dialog open={showVideoModal} onOpenChange={() => setShowVideoModal(false)}>
          <DialogContent className="max-w-4xl bg-white dark:bg-slate-950 border-0 p-0">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white p-2 rounded z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full bg-slate-950 dark:bg-black flex justify-center items-center">
              {project.videoUrl.endsWith('.mp4') || 
               project.videoUrl.endsWith('.webm') || 
               project.videoUrl.endsWith('.ogg') || 
               project.videoUrl.includes('/media/') ? (
                <video
                  src={project.videoUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[500px]"
                />
              ) : (
                <iframe
                  width="100%"
                  height="500"
                  src={project.videoUrl}
                  title={project.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                ></iframe>
              )}
            </div>
            <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-50">
              <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
              <p className="text-slate-400 dark:text-slate-500">{project.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Portfolio;
