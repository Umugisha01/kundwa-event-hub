import { resolveMediaUrl } from "@/config/api";

export type VideoPlatform = 
  | "youtube" 
  | "instagram" 
  | "tiktok" 
  | "vimeo" 
  | "facebook" 
  | "dailymotion" 
  | "direct" 
  | "other";

export interface VideoEmbedInfo {
  platform: VideoPlatform;
  platformName: string;
  embedUrl: string;
  directUrl?: string;
  originalUrl: string;
  isDirectVideo: boolean;
  aspectRatio: "16/9" | "9/16" | "4/5" | "1/1";
  supportsIframe: boolean;
  externalWatchUrl: string;
}

/**
 * Parses any video URL from any popular platform (YouTube, Instagram, TikTok, Vimeo, Facebook, direct files, etc.)
 * and transforms it into the appropriate embeddable URL and display configuration.
 */
export function parseVideoUrl(rawUrl: string | null | undefined): VideoEmbedInfo | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  const url = rawUrl.trim();
  if (!url) return null;

  // 1. Direct Video Files (.mp4, .mov, .webm, .ogg, .m4v, .mkv, backend uploads, blob)
  const isDirectFile = 
    /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(url) ||
    url.includes("/media/uploads/") ||
    url.startsWith("blob:") ||
    url.startsWith("data:video/");

  if (isDirectFile) {
    const resolved = resolveMediaUrl(url);
    return {
      platform: "direct",
      platformName: "Video File",
      embedUrl: "",
      directUrl: resolved,
      originalUrl: url,
      isDirectVideo: true,
      aspectRatio: "16/9",
      supportsIframe: false,
      externalWatchUrl: resolved,
    };
  }

  // 2. YouTube (watch?v=, youtu.be/, /embed/, /shorts/, /live/, /v/)
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+?&v=|shorts\/|live\/))([\w-]{11})/i
  );

  if (ytMatch) {
    const videoId = ytMatch[1];
    const isShort = url.includes("/shorts/");

    // Check for start time / timestamp (t=120 or start=120 or t=2m10s)
    let startTime: string | null = null;
    const timeMatch = url.match(/[?&](?:t|start)=([0-9hms]+)/i);
    if (timeMatch) {
      const rawTime = timeMatch[1];
      if (/^\d+$/.test(rawTime)) {
        startTime = rawTime;
      } else {
        // Parse format like 1h2m3s
        let total = 0;
        const h = rawTime.match(/(\d+)h/i);
        const m = rawTime.match(/(\d+)m/i);
        const s = rawTime.match(/(\d+)s/i);
        if (h) total += parseInt(h[1], 10) * 3600;
        if (m) total += parseInt(m[1], 10) * 60;
        if (s) total += parseInt(s[1], 10);
        if (total > 0) startTime = String(total);
      }
    }

    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    if (startTime) params.set("start", startTime);

    return {
      platform: "youtube",
      platformName: "YouTube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: isShort ? "9/16" : "16/9",
      supportsIframe: true,
      externalWatchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // 3. Instagram (reels, posts, tv)
  const igMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
  );
  if (igMatch) {
    const shortcode = igMatch[1];
    const isReel = url.includes("/reel");
    return {
      platform: "instagram",
      platformName: "Instagram",
      embedUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${shortcode}/embed`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: isReel ? "9/16" : "4/5",
      supportsIframe: true,
      externalWatchUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${shortcode}/`,
    };
  }

  // 4. TikTok (videos, web, mobile, shorts)
  const tiktokMatch = url.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?tiktok\.com\/(?:@[^\/]+\/video\/|v\/|embed\/v2\/)(\d+)/i
  );
  if (tiktokMatch) {
    const videoId = tiktokMatch[1];
    return {
      platform: "tiktok",
      platformName: "TikTok",
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: "9/16",
      supportsIframe: true,
      externalWatchUrl: url,
    };
  }

  // Short TikTok links like vm.tiktok.com/xxx or vt.tiktok.com/xxx
  if (/tiktok\.com\//i.test(url)) {
    return {
      platform: "tiktok",
      platformName: "TikTok",
      embedUrl: url,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: "9/16",
      supportsIframe: true,
      externalWatchUrl: url,
    };
  }

  // 5. Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  if (vimeoMatch) {
    const videoId = vimeoMatch[1] || vimeoMatch[2];
    return {
      platform: "vimeo",
      platformName: "Vimeo",
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&dnt=1`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: "16/9",
      supportsIframe: true,
      externalWatchUrl: `https://vimeo.com/${videoId}`,
    };
  }

  // 6. Facebook Video
  if (/facebook\.com\/(?:.+?\/videos\/\d+|watch\/?\?v=\d+)|fb\.watch\//i.test(url)) {
    const cleanUrl = url.split("?")[0];
    const encoded = encodeURIComponent(cleanUrl);
    return {
      platform: "facebook",
      platformName: "Facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0&autoplay=1`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: "16/9",
      supportsIframe: true,
      externalWatchUrl: url,
    };
  }

  // 7. Dailymotion
  const dmMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([A-Za-z0-9]+)/i);
  if (dmMatch) {
    const videoId = dmMatch[1];
    return {
      platform: "dailymotion",
      platformName: "Dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`,
      originalUrl: url,
      isDirectVideo: false,
      aspectRatio: "16/9",
      supportsIframe: true,
      externalWatchUrl: `https://www.dailymotion.com/video/${videoId}`,
    };
  }

  // 8. Other / Generic iframe URL (e.g. if already an embed link)
  return {
    platform: "other",
    platformName: "Web Video",
    embedUrl: url,
    originalUrl: url,
    isDirectVideo: false,
    aspectRatio: "16/9",
    supportsIframe: true,
    externalWatchUrl: url,
  };
}
