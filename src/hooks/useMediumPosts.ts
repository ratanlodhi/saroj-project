/**
 * useMediumPosts
 *
 * TanStack Query hook that fetches and caches Medium articles.
 *
 * Data flow:
 *  1. Optional override: VITE_MEDIUM_API_URL (any JSON endpoint returning MediumPostsResponse).
 *  2. Development: GET /dev/medium-feed — Vite serves raw RSS XML; we parse in the browser.
 *  3. Production: Supabase Edge Function `medium-posts` returns JSON (rss2json removed — it
 *    often returns 422 for Medium URLs).
 */

import { useQuery } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  /** Plain text description, HTML stripped, max ~200 chars. */
  description: string;
  categories: string[];
  author: string;
}

export interface MediumFeed {
  title: string;
  description: string;
  link: string;
  image: string;
  author: string;
}

export interface MediumPostsResponse {
  feed: MediumFeed;
  posts: MediumPost[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MEDIUM_FEED_URL = "https://sarojprakashbandi.medium.com/feed";
const MEDIA_NS = "http://search.yahoo.com/mrss/";
const DC_NS = "http://purl.org/dc/elements/1.1/";
const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";
const MAX_POSTS = 20;

/** Small Medium CDN squares are almost always author avatars, not article art. */
function isLikelyAuthorAvatar(url: string): boolean {
  const u = decodeURIComponent(url).toLowerCase();
  if (/avatar|gravatar|profile-photo|profile_images/.test(u)) return true;
  const fit = /\/fit\/c\/(\d+)\/(\d+)\//.exec(u);
  if (!fit) return false;
  const w = parseInt(fit[1], 10);
  const h = parseInt(fit[2], 10);
  if (Number.isNaN(w) || Number.isNaN(h)) return false;
  if (Math.max(w, h) >= 400) return false;
  if (w <= 320 && h <= 320) return true;
  return false;
}

function scoreArticleImageUrl(url: string): number {
  let s = 0;
  if (url.includes("miro.medium.com")) s += 80;
  if (url.includes("/max/")) s += 60;
  const resize = /resize:fit:(\d+)/i.exec(url);
  if (resize) s += parseInt(resize[1], 10) / 20;
  const fit = /\/fit\/c\/(\d+)\/(\d+)\//.exec(url);
  if (fit) {
    const w = parseInt(fit[1], 10);
    const h = parseInt(fit[2], 10);
    s += Math.min(w, h) / 50;
  }
  return s;
}

function pickBestArticleImage(urls: string[]): string {
  const uniq = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  const preferred = uniq.filter((u) => !isLikelyAuthorAvatar(u));
  const pool = preferred.length > 0 ? preferred : uniq;
  if (pool.length === 0) return "";
  return pool.reduce((best, u) =>
    scoreArticleImageUrl(u) > scoreArticleImageUrl(best) ? u : best,
  );
}

function extractImgSrcsFromHtml(html: string): string[] {
  if (!html.trim()) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("img"))
    .map((img) => img.getAttribute("src")?.trim() ?? "")
    .filter(Boolean);
}

function getContentEncoded(item: Element): string {
  const list = item.getElementsByTagNameNS(CONTENT_NS, "encoded");
  const el = list[0];
  return el?.innerHTML ?? el?.textContent ?? "";
}

function getMediaContentUrl(item: Element): string {
  const contents = item.getElementsByTagNameNS(MEDIA_NS, "content");
  return contents[0]?.getAttribute("url")?.trim() ?? "";
}

function getMediaThumbnailUrl(item: Element): string {
  const thumbs = item.getElementsByTagNameNS(MEDIA_NS, "thumbnail");
  const u = thumbs[0]?.getAttribute("url")?.trim();
  if (u) return u;
  return "";
}

function resolveArticleThumbnail(item: Element, rawDesc: string): string {
  const rawEncoded = getContentEncoded(item);
  const fromHtml = [
    ...extractImgSrcsFromHtml(rawEncoded),
    ...extractImgSrcsFromHtml(rawDesc),
  ];
  const fromMedia = [getMediaContentUrl(item), getMediaThumbnailUrl(item)];
  const picked = pickBestArticleImage([...fromHtml, ...fromMedia]);
  if (picked) return picked;
  return fromMedia[0] ?? fromHtml[0] ?? "";
}

function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    "https://dcrfsaggvdfjjvinryxt.supabase.co"
  );
}

/** Mirrors useBlogFeed / Supabase client fallbacks for authenticated function calls. */
function getSupabaseAnonKey(): string {
  const fromEnv =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (fromEnv) return fromEnv;
  const url = getSupabaseUrl();
  if (url.includes("dcrfsaggvdfjjvinryxt.supabase.co")) {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcmZzYWdndmRmamp2aW5yeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk2NjcsImV4cCI6MjA4NDk4NTY2N30.3jwSRMODQSYLGar9uxxeCJ21FYV6Mo-c6gEEbgawwAA";
  }
  return "";
}

/**
 * Custom JSON API, or dev XML proxy, or production Edge Function (JSON).
 */
function mediumPostsFetchUrl(): string {
  const custom = import.meta.env.VITE_MEDIUM_API_URL as string | undefined;
  if (custom) return custom;
  if (import.meta.env.DEV) {
    return "/dev/medium-feed";
  }
  return `${getSupabaseUrl()}/functions/v1/medium-posts`;
}

function mediumPostsFetchInit(url: string): RequestInit | undefined {
  if (url.startsWith("/dev/")) return undefined;
  const anon = getSupabaseAnonKey();
  if (!anon) return undefined;
  return {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip HTML tags and decode common HTML entities from a string. */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s{2,}/g, " ").trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "\u2026";
}

function dcCreator(el: Element): string {
  const list = el.getElementsByTagNameNS(DC_NS, "creator");
  return list[0]?.textContent?.trim() ?? "";
}

/** Parse Medium RSS XML (dev proxy path). Kept aligned with supabase/functions/medium-posts. */
function parseMediumRssXml(xml: string): MediumPostsResponse {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Failed to parse Medium RSS XML");
  }

  const channel = doc.querySelector("channel");
  if (!channel) {
    throw new Error("Invalid RSS: missing channel");
  }

  const feedAuthor = dcCreator(channel);

  const feedTitle = channel.querySelector("title")?.textContent ?? "";
  const feedDesc = channel.querySelector("description")?.textContent ?? "";
  const feedLink =
    channel.querySelector(":scope > link")?.textContent?.trim() ?? "";
  const imageUrl = channel.querySelector("image > url")?.textContent ?? "";

  const itemNodes = channel.querySelectorAll(":scope > item");
  const posts: MediumPost[] = [];

  itemNodes.forEach((item) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? "";
    const link = item.querySelector("link")?.textContent?.trim() ?? "";
    const pubDate = item.querySelector("pubDate")?.textContent?.trim() ?? "";

    const descEl = item.querySelector("description");
    const rawDesc =
      descEl?.innerHTML ?? descEl?.textContent ?? "";

    const thumbnail = resolveArticleThumbnail(item, rawDesc);

    const categories: string[] = [];
    item.querySelectorAll("category").forEach((c) => {
      const t = c.textContent?.trim();
      if (t) categories.push(t);
    });

    const author = dcCreator(item) || feedAuthor;

    posts.push({
      title,
      link,
      pubDate,
      thumbnail,
      description: truncate(stripHtml(rawDesc), 200),
      categories,
      author,
    });
  });

  return {
    feed: {
      title: feedTitle,
      description: feedDesc,
      link: feedLink,
      image: imageUrl,
      author: feedAuthor,
    },
    posts: posts.slice(0, MAX_POSTS),
  };
}

// ─── Fetch function ───────────────────────────────────────────────────────────

async function fetchMediumPosts(): Promise<MediumPostsResponse> {
  const url = mediumPostsFetchUrl();
  const init = mediumPostsFetchInit(url);
  const res = await fetch(url, init);

  const text = await res.text();

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) detail = j.error;
    } catch {
      if (text) detail = text.slice(0, 200);
    }
    throw new Error(detail || `Request failed: ${res.status}`);
  }

  const trimmed = text.trimStart();
  if (trimmed.startsWith("{")) {
    const raw = JSON.parse(text) as Record<string, unknown>;
    if ("error" in raw && raw.error) {
      throw new Error(String(raw.error));
    }
    const body = raw as MediumPostsResponse;
    return {
      feed: body.feed,
      posts: (body.posts ?? []).slice(0, MAX_POSTS),
    };
  }

  return parseMediumRssXml(text);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMediumPosts() {
  return useQuery<MediumPostsResponse, Error>({
    queryKey: ["medium-posts"],
    queryFn: fetchMediumPosts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
