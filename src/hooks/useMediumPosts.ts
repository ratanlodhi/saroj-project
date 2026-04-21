/**
 * useMediumPosts
 *
 * TanStack Query hook that fetches and caches Medium articles.
 *
 * Data flow:
 *  1. In production with Edge Function deployed:
 *     Set VITE_MEDIUM_API_URL to your Supabase function URL:
 *     https://<project-ref>.supabase.co/functions/v1/medium-posts
 *
 *  2. Otherwise (default): calls the rss2json public API directly.
 *     No backend required — rss2json handles CORS.
 * 
 *
 * Both sources are normalized into the same MediumPost shape.
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

/**
 * If VITE_MEDIUM_API_URL is set (pointing to your deployed Edge Function),
 * we use that. Otherwise we call rss2json directly from the browser.
 */
const API_URL =
  import.meta.env.VITE_MEDIUM_API_URL ||
  `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}&count=20`;

const IS_DIRECT_RSS2JSON = !import.meta.env.VITE_MEDIUM_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Strip HTML tags and decode common HTML entities from a string. */
function stripHtml(html: string): string {
  // DOMParser is available in all modern browsers and safe for this purpose
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s{2,}/g, " ").trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "\u2026";
}

// ─── Fetch function ───────────────────────────────────────────────────────────

async function fetchMediumPosts(): Promise<MediumPostsResponse> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  // deno-lint-ignore no-explicit-any
  const raw: Record<string, any> = await res.json();

  // ── Response from our Edge Function (already normalized) ──────────────────
  if (!IS_DIRECT_RSS2JSON) {
    if ("error" in raw) throw new Error(raw.error as string);
    return raw as MediumPostsResponse;
  }

  // ── Response directly from rss2json — needs normalization ─────────────────
  if (raw.status !== "ok") {
    throw new Error(`rss2json error: ${raw.message ?? "Unknown error"}`);
  }

  const feedAuthor: string =
    typeof raw.feed?.author === "string" ? raw.feed.author : "";

  // deno-lint-ignore no-explicit-any
  const posts: MediumPost[] = (raw.items ?? []).map((item: Record<string, any>) => {
    const rawDescription =
      typeof item.description === "string" ? item.description : "";
    return {
      title: typeof item.title === "string" ? item.title.trim() : "",
      link: typeof item.link === "string" ? item.link : "",
      pubDate: typeof item.pubDate === "string" ? item.pubDate : "",
      thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : "",
      description: truncate(stripHtml(rawDescription), 200),
      categories: Array.isArray(item.categories) ? item.categories : [],
      author:
        typeof item.author === "string" && item.author.trim()
          ? item.author.trim()
          : feedAuthor,
    };
  });

  return {
    feed: {
      title: raw.feed?.title ?? "",
      description: raw.feed?.description ?? "",
      link: raw.feed?.link ?? "",
      image: raw.feed?.image ?? "",
      author: feedAuthor,
    },
    posts,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMediumPosts() {
  return useQuery<MediumPostsResponse, Error>({
    queryKey: ["medium-posts"],
    queryFn: fetchMediumPosts,
    staleTime: 5 * 60 * 1000,  // treat data as fresh for 5 minutes (matches server cache TTL)
    gcTime: 10 * 60 * 1000,    // keep in the query cache for 10 minutes after unmount
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
