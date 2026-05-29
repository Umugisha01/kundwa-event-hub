import { useState } from "react";
import { Layout } from "@/components/Layout";
import { portfolioProjects } from "@/data/portfolio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const project = selectedProject
    ? portfolioProjects.find((p) => p.id === selectedProject)
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">Our Portfolio</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore our recent projects showcasing professional event production, sound engineering, and stage design
            </p>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioProjects.map((project) => (
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
            <div className="w-full bg-slate-950 dark:bg-black">
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
