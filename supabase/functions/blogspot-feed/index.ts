/**
 * Proxies the Blogspot RSS feed so the browser can read it without CORS errors.
 *
 * Set secret: supabase secrets set BLOGSPOT_FEED_URL="https://....blogspot.com/feeds/posts/default?alt=rss"
 * Deploy:      supabase functions deploy blogspot-feed --no-verify-jwt
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Max-Age": "86400",
};

const DEFAULT_FEED_URL =
  "https://sarojprakashbandi.blogspot.com/feeds/posts/default?alt=rss";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const feedUrl = Deno.env.get("BLOGSPOT_FEED_URL") ?? DEFAULT_FEED_URL;

  try {
    const upstream = await fetch(feedUrl, {
      headers: {
        "User-Agent": "RasayanStudio/1.0 (blog feed)",
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream RSS returned ${upstream.status}: ${upstream.statusText}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const text = await upstream.text();

    return new Response(text, {
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("Content-Type") ??
          "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    console.error("[blogspot-feed]", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to fetch RSS",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
