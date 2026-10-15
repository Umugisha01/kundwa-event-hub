import React, { useState } from "react";
import { parseVideoUrl, VideoEmbedInfo } from "@/utils/videoEmbed";
import { ExternalLink, Play, AlertCircle, Loader2 } from "lucide-react";
import { FaYoutube, FaInstagram, FaTiktok, FaVimeoV, FaFacebook } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  url,
  title = "Project Video",
  className = "",
  autoPlay = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const videoInfo: VideoEmbedInfo | null = parseVideoUrl(url);

  if (!videoInfo) {
    return (
      <div className="w-full p-8 text-center bg-slate-900 rounded-xl text-slate-300">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-sm">No valid video URL provided.</p>
      </div>
    );
  }

  // Render Platform Icon / Badge
  const renderPlatformBadge = () => {
    switch (videoInfo.platform) {
      case "youtube":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/90 text-white shadow-sm">
            <FaYoutube className="w-3.5 h-3.5" /> YouTube
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-sm">
            <FaInstagram className="w-3.5 h-3.5" /> Instagram
          </span>
        );
      case "tiktok":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black border border-slate-700 text-white shadow-sm">
            <FaTiktok className="w-3.5 h-3.5 text-cyan-400" /> TikTok
          </span>
        );
      case "vimeo":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500 text-white shadow-sm">
            <FaVimeoV className="w-3.5 h-3.5" /> Vimeo
          </span>
        );
      case "facebook":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm">
            <FaFacebook className="w-3.5 h-3.5" /> Facebook
          </span>
        );
      case "direct":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white shadow-sm">
            <Play className="w-3.5 h-3.5 fill-current" /> HD Video
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 shadow-sm">
            <Play className="w-3.5 h-3.5 fill-current" /> Video Player
          </span>
        );
    }
  };

  // 1. Direct Video File (.mp4, .mov, etc.)
  if (videoInfo.isDirectVideo && videoInfo.directUrl) {
    return (
      <div className={`relative w-full flex flex-col bg-black rounded-xl overflow-hidden ${className}`}>
        {/* Top bar info */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 z-10">
          <div className="flex items-center gap-2">
            {renderPlatformBadge()}
            <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>
          <a
            href={videoInfo.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition"
          >
            Full View <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="relative flex justify-center items-center bg-black min-h-[300px] max-h-[75vh]">
          <video
            src={videoInfo.directUrl}
            controls
            autoPlay={autoPlay}
            playsInline
            className="w-full h-full max-h-[75vh] object-contain"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-300">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
              <p className="text-sm font-semibold mb-3">Unable to play video file directly.</p>
              <a href={videoInfo.directUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-2">
                  Open video file in new tab <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Embedded Video (YouTube, Instagram, TikTok, Vimeo, etc.)
  const isPortrait = videoInfo.aspectRatio === "9/16" || videoInfo.aspectRatio === "4/5";

  return (
    <div className={`relative w-full flex flex-col bg-slate-950 rounded-xl overflow-hidden ${className}`}>
      {/* Top Header bar with platform badge and external link */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          {renderPlatformBadge()}
          <span className="text-xs font-medium text-slate-300 truncate max-w-[200px] sm:max-w-sm">
            {title}
          </span>
        </div>
        <a
          href={videoInfo.externalWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5 transition px-2 py-1 rounded hover:bg-slate-800"
        >
          <span>Watch on {videoInfo.platformName}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Frame Container */}
      <div
        className={`relative w-full flex justify-center items-center bg-black overflow-hidden ${
          isPortrait ? "p-2 sm:p-4" : ""
        }`}
      >
        <div
          className={`relative w-full ${
            videoInfo.aspectRatio === "9/16"
              ? "max-w-[420px] aspect-[9/16] max-h-[75vh]"
              : videoInfo.aspectRatio === "4/5"
              ? "max-w-[480px] aspect-[4/5] max-h-[75vh]"
              : "aspect-video max-h-[70vh]"
          } rounded-lg overflow-hidden shadow-2xl`}
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-300">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-xs text-slate-400">Loading {videoInfo.platformName} player...</p>
            </div>
          )}

          <iframe
            key={videoInfo.embedUrl}
            src={videoInfo.embedUrl}
            title={title}
            className="w-full h-full border-0 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      </div>

      {/* Footer helper for seamless accessibility */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>Powered by {videoInfo.platformName}</span>
        <a
          href={videoInfo.externalWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          Having playback issues? Open in {videoInfo.platformName} app <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
