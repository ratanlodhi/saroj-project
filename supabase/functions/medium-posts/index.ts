/**
 * Supabase Edge Function: medium-posts
 *
 * Fetches the Medium RSS feed directly, parses XML with fast-xml-parser, and
 * returns JSON. In-memory cache for 5 minutes.
 *
 * Deploy:  supabase functions deploy medium-posts --no-verify-jwt
 * Local:   supabase functions serve medium-posts --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { XMLParser } from "npm:fast-xml-parser@4.3.6";

// ─── Constants ───────────────────────────────────────────────────────────────

const MEDIUM_FEED_URL = "https://sarojprakashbandi.medium.com/feed";
const CACHE_TTL_MS = 5 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Max-Age": "86400",
};

// ─── In-memory cache (resets on cold start) ─────────────────────────────────

interface CacheEntry {
  data: MediumPostsResponse;
  timestamp: number;
}

let cache: CacheEntry | null = null;

// ─── Types (kept in sync with src/hooks/useMediumPosts.ts) ─────────────────

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}

/** RSS channel may return one item as object instead of array. */
// deno-lint-ignore no-explicit-any
function normalizeItems(item: any): any[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/** Small Medium CDN squares are usually author avatars, not article covers (matches client hook). */
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
  let best = pool[0]!;
  for (let i = 1; i < pool.length; i++) {
    const u = pool[i]!;
    if (scoreArticleImageUrl(u) > scoreArticleImageUrl(best)) best = u;
  }
  return best;
}

function extractImgSrcsFromHtml(html: string): string[] {
  if (!html) return [];
  const out: string[] = [];
  const re = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function getMediaContentUrl(
  // deno-lint-ignore no-explicit-any
  item: Record<string, any>,
): string {
  const content = item["media:content"];
  if (content?.["@_url"]) return String(content["@_url"]).trim();
  return "";
}

function getMediaThumbnailUrl(
  // deno-lint-ignore no-explicit-any
  item: Record<string, any>,
): string {
  const thumb = item["media:thumbnail"];
  if (thumb?.["@_url"]) return String(thumb["@_url"]).trim();
  if (typeof thumb === "string") return thumb.trim();
  return "";
}

function resolveArticleThumbnail(
  // deno-lint-ignore no-explicit-any
  item: Record<string, any>,
  rawDesc: string,
): string {
  const rawEncoded =
    typeof item["content:encoded"] === "string" ? item["content:encoded"] : "";
  const fromHtml = [
    ...extractImgSrcsFromHtml(rawEncoded),
    ...extractImgSrcsFromHtml(rawDesc),
  ];
  const fromMedia = [getMediaContentUrl(item), getMediaThumbnailUrl(item)];
  const picked = pickBestArticleImage([...fromHtml, ...fromMedia]);
  if (picked) return picked;
  return fromMedia[0] ?? fromHtml[0] ?? "";
}

function categoriesFromItem(
  // deno-lint-ignore no-explicit-any
  item: Record<string, any>,
): string[] {
  const c = item.category;
  if (!c) return [];
  if (Array.isArray(c)) return c.map(String);
  return [String(c)];
}

// deno-lint-ignore no-explicit-any
function feedImageFromChannel(ch: any): string {
  const img = ch?.image;
  if (img?.url) return String(img.url);
  if (typeof img === "string") return img;
  return "";
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const now = Date.now();

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

    const res = await fetch(MEDIUM_FEED_URL, {
      headers: { "User-Agent": "RasayanStudio/1.0 (Medium RSS)" },
    });
    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status}`);
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    // deno-lint-ignore no-explicit-any
    const json = parser.parse(xml) as any;
    const channel = json?.rss?.channel;
    if (!channel) {
      throw new Error("Invalid RSS: missing channel");
    }

    const items = normalizeItems(channel.item);
    const feedAuthor =
      typeof channel["dc:creator"] === "string" ? channel["dc:creator"] : "";

    const posts: MediumPost[] = items.map(
      // deno-lint-ignore no-explicit-any
      (item: Record<string, any>) => {
        const rawDesc = typeof item.description === "string" ? item.description : "";
        const author =
          (typeof item["dc:creator"] === "string" ? item["dc:creator"] : "") ||
          feedAuthor;

        return {
          title: typeof item.title === "string" ? item.title : "",
          link: typeof item.link === "string" ? item.link : "",
          pubDate: typeof item.pubDate === "string" ? item.pubDate : "",
          thumbnail: resolveArticleThumbnail(item, rawDesc),
          description: truncate(stripHtml(rawDesc), 200),
          categories: categoriesFromItem(item),
          author: author.trim(),
        };
      },
    );

    const payload: MediumPostsResponse = {
      feed: {
        title: typeof channel.title === "string" ? channel.title : "",
        description:
          typeof channel.description === "string" ? channel.description : "",
        link: typeof channel.link === "string" ? channel.link : "",
        image: feedImageFromChannel(channel),
        author: feedAuthor,
      },
      posts,
    };

    cache = { data: payload, timestamp: now };

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "X-Cache": "MISS",
      },
    });
  } catch (err) {
    console.error("[medium-posts] Error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to fetch Medium posts",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
