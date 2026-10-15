import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  X, 
  FolderKanban, 
  AlertCircle, 
  RefreshCw, 
  Image as ImageIcon,
  Calendar,
  Building,
  Video
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveMediaUrl } from "@/config/api";
import { useTheme } from "@/contexts/ThemeContext";
import { UniversalVideoPlayer } from "@/components/video/UniversalVideoPlayer";
import heroImg from "@/assets/hero-event.jpg";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  images: string[];
  hasMultipleImages: boolean;
  videoUrl?: string;
  date: string;
  client?: string;
}

const Portfolio = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeModalTab, setActiveModalTab] = useState<"photos" | "video">("photos");
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
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
        const mapped: PortfolioItem[] = data.map((p: any) => {
          const rawExtra = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
          
          // Additional images are optional. If none are provided, the gallery displays the main thumbnail.
          const resolvedThumbnail = resolveMediaUrl(p.thumbnail, heroImg);
          const gallery = rawExtra.length > 0
            ? rawExtra.map((img: string) => resolveMediaUrl(img, heroImg))
            : [resolvedThumbnail];

          // True if there is more than 1 photo or extra photos were uploaded
          const hasMultiple = rawExtra.length > 0 && !(rawExtra.length === 1 && rawExtra[0] === p.thumbnail);

          return {
            id: p.id,
            title: p.title || "Project",
            category: p.category || "Event Production",
            description: p.description || "",
            thumbnail: resolvedThumbnail,
            images: gallery,
            hasMultipleImages: hasMultiple,
            videoUrl: p.video_url?.trim() || undefined,
            date: p.date || "",
            client: p.client || undefined
          };
        });
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

  const closeModal = () => {
    setSelectedProject(null);
    setSelectedImageIndex(0);
    setActiveModalTab("photos");
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

          {/* Ambient blurred glow layers */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

          {/* Flowing Curves */}
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
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-xs uppercase tracking-widest font-semibold mb-3">
            Our Proven Track Record
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-2 mb-4 tracking-tight">Our Portfolio</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explore our recent projects showcasing professional event production, sound engineering, stage lighting, and creative designs.
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
                  : "We are currently curating and uploading high-definition photo galleries and video reels from our latest productions across East Africa."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact">
                  <Button className="btn-gold">Contact Production Team</Button>
                </Link>
                <Button variant="outline" onClick={() => fetchPortfolio()} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedProject(item.id);
                    setSelectedImageIndex(0);
                    setActiveModalTab(item.videoUrl ? "video" : "photos");
                  }}
                  className="group cursor-pointer bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  {/* Project Thumbnail & Quick Actions */}
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        {item.category}
                      </span>
                      {item.videoUrl && (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <Play className="w-3 h-3 fill-current" /> Video
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(item.id);
                          setSelectedImageIndex(0);
                          setActiveModalTab("photos");
                        }}
                        className="bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full transition shadow-lg hover:scale-110 flex items-center gap-1.5 text-xs font-semibold px-4"
                        title="View Photos"
                      >
                        <ImageIcon className="w-4 h-4 text-primary" /> Photos
                      </button>
                      {item.videoUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(item.id);
                            setActiveModalTab("video");
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition shadow-lg hover:scale-110 flex items-center gap-1.5 text-xs font-semibold px-4"
                          title="Play Video"
                        >
                          <Play className="w-4 h-4 fill-current" /> Watch Video
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {item.date}
                      </span>
                      {item.client && (
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <Building className="w-3.5 h-3.5" /> {item.client}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unified Project Modal (Photos & Universal Video Player) */}
      {project && (
        <Dialog open={!!selectedProject} onOpenChange={(open) => { if (!open) closeModal(); }}>
          <DialogContent className="max-w-4xl max-h-[92vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 z-20">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">
                    {project.title}
                  </h2>
                  <p className="text-xs text-primary font-medium">{project.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch between Photos & Video if project has both */}
                {project.videoUrl && (
                  <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveModalTab("photos")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                        activeModalTab === "photos"
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Photos</span>
                      {project.hasMultipleImages && (
                        <span className="text-[10px] opacity-75">({project.images.length})</span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveModalTab("video")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                        activeModalTab === "video"
                          ? "bg-red-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Video</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={closeModal}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 p-2 rounded-lg transition"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* VIDEO TAB */}
              {activeModalTab === "video" && project.videoUrl ? (
                <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center">
                  <UniversalVideoPlayer
                    url={project.videoUrl}
                    title={project.title}
                    className="max-w-3xl shadow-2xl"
                  />
                </div>
              ) : (
                /* PHOTOS TAB */
                <div className="relative bg-black flex flex-col items-center justify-center">
                  <div className="relative w-full max-h-[55vh] flex justify-center items-center overflow-hidden bg-black">
                    <img
                      src={project.images[selectedImageIndex] || project.thumbnail}
                      alt={`${project.title} - Photo ${selectedImageIndex + 1}`}
                      className="w-full h-auto max-h-[55vh] object-contain select-none"
                    />

                    {/* Navigation Buttons (Only shown if multiple images exist) */}
                    {project.hasMultipleImages && project.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          disabled={selectedImageIndex === 0}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          disabled={selectedImageIndex === project.images.length - 1}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip (Only shown if multiple images exist) */}
                  {project.hasMultipleImages && project.images.length > 1 && (
                    <div className="w-full bg-slate-900/90 py-3 px-6 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">
                        Photo {selectedImageIndex + 1} of {project.images.length}
                      </span>
                      <div className="flex gap-2 overflow-x-auto max-w-md py-1">
                        {project.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border-2 transition ${
                              idx === selectedImageIndex
                                ? "border-primary scale-105 shadow-md"
                                : "border-slate-700 opacity-60 hover:opacity-100"
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
                    </div>
                  )}
                </div>
              )}

              {/* Project Description & Details */}
              <div className="p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 space-y-4">
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-primary" /> {project.date}
                  </span>
                  {project.client && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building className="w-4 h-4 text-primary" /> Client: {project.client}
                    </span>
                  )}
                  {project.videoUrl && (
                    <span className="flex items-center gap-1.5 font-medium text-red-500">
                      <Video className="w-4 h-4" /> Video Included
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Project Overview
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Quick switch to video button if on photos tab */}
                {activeModalTab === "photos" && project.videoUrl && (
                  <Button
                    onClick={() => setActiveModalTab("video")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Production Video
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Portfolio;
