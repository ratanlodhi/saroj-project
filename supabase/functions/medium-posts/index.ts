/**
 * Supabase Edge Function: medium-posts
 *
 * Acts as the /api/medium-posts backend endpoint.
 * Fetches the Medium RSS feed via the rss2json API, transforms the data into a
 * clean JSON structure, and caches the result in memory for 5 minutes to
 * avoid hammering the upstream API on every request.
 *
 * Deploy:  supabase functions deploy medium-posts --no-verify-jwt
 * Local:   supabase functions serve medium-posts --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── Constants ───────────────────────────────────────────────────────────────

const MEDIUM_FEED_URL = "https://sarojprakashbandi.medium.com/feed";
const RSS2JSON_API_URL =
  `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}&count=20`;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── In-memory cache (resets on cold start) ──────────────────────────────────

interface CacheEntry {
  data: MediumPostsResponse;
  timestamp: number;
}

let cache: CacheEntry | null = null;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string; // plain text, HTML stripped
  categories: string[];
  author: string;
}

export interface MediumPostsResponse {
  feed: {
    title: string;
    description: string;
    link: string;
    image: string;
    author: string;
  };
  posts: MediumPost[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove HTML tags and decode common HTML entities. */
function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  return withoutTags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Trim text to maxLength characters, appending an ellipsis if truncated. */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026"; // …
}

/** Transform a raw rss2json item into our MediumPost shape. */
// deno-lint-ignore no-explicit-any
function transformItem(item: Record<string, any>, feedAuthor: string): MediumPost {
  const rawDescription =
    typeof item.description === "string" ? item.description : "";
  const cleanDescription = truncate(stripHtml(rawDescription), 200);

  return {
    title: typeof item.title === "string" ? item.title.trim() : "",
    link: typeof item.link === "string" ? item.link : "",
    pubDate: typeof item.pubDate === "string" ? item.pubDate : "",
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : "",
    description: cleanDescription,
    categories: Array.isArray(item.categories) ? item.categories : [],
    author:
      typeof item.author === "string" && item.author.trim()
        ? item.author.trim()
        : feedAuthor,
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();

    // Return cached response if still fresh
    if (cache && now - cache.timestamp < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cache.data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // Fetch from rss2json
    const upstream = await fetch(RSS2JSON_API_URL);
    if (!upstream.ok) {
      throw new Error(`rss2json API returned ${upstream.status}`);
    }

    // deno-lint-ignore no-explicit-any
    const raw: Record<string, any> = await upstream.json();

    if (raw.status !== "ok") {
      throw new Error(`rss2json error: ${raw.message ?? "Unknown error"}`);
    }

    const feedAuthor =
      typeof raw.feed?.author === "string" ? raw.feed.author : "";

    // Build the response payload
    const payload: MediumPostsResponse = {
      feed: {
        title: raw.feed?.title ?? "",
        description: raw.feed?.description ?? "",
        link: raw.feed?.link ?? "",
        image: raw.feed?.image ?? "",
        author: feedAuthor,
      },
      // deno-lint-ignore no-explicit-any
      posts: (raw.items ?? []).map((item: Record<string, any>) =>
        transformItem(item, feedAuthor)
      ),
    };

    // Persist to in-memory cache
    cache = { data: payload, timestamp: now };

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("[medium-posts] Error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to fetch Medium posts",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
