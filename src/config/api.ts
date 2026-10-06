/**
 * API and Media URL configuration
 * Reads VITE_API_URL if configured for cloud deployment (e.g. Render/Railway),
 * otherwise falls back to local relative paths proxied by Vite.
 */

export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/**
 * Returns a fully qualified or relative API endpoint URL.
 * Example: apiUrl("/api/events/") -> "https://api.kundwa.com/api/events/" or "/api/events/"
 */
export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Resolves media/image paths.
 * If the image starts with `/media/` and API_BASE is configured, prefixes with API_BASE.
 * Preserves absolute URLs, data URLs, and frontend static assets like `/assets/...`.
 */
export function resolveMediaUrl(url: string | null | undefined, fallback: string = ""): string {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  // Handle uploaded media from backend
  if (url.startsWith("/media/") || url.startsWith("media/")) {
    const cleanMedia = url.startsWith("/") ? url : `/${url}`;
    return API_BASE ? `${API_BASE}${cleanMedia}` : cleanMedia;
  }

  return url;
}
