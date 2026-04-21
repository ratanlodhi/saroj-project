import type { Plugin } from "vite";

const BLOGSPOT_FEED_DEFAULT =
  "https://sarojprakashbandi.blogspot.com/feeds/posts/default?alt=rss";

/**
 * In dev, respond to GET /dev/blogspot-feed by fetching the Blogger RSS in Node
 * (no Supabase Edge Function needed). Uses a dedicated path so it never competes
 * with Vite's /functions/v1 → Supabase proxy.
 */
export function devBlogspotFeedPlugin(
  feedUrl: string = BLOGSPOT_FEED_DEFAULT,
): Plugin {
  return {
    name: "dev-blogspot-feed",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }
        const path = req.url?.split("?")[0] ?? "";
        if (path !== "/dev/blogspot-feed") {
          next();
          return;
        }

        void fetch(feedUrl, {
          headers: { "User-Agent": "ViteDevBlogspotFeed/1.0" },
        })
          .then(async (upstream) => {
            const text = await upstream.text();
            const ct =
              upstream.headers.get("content-type") ??
              "application/xml; charset=utf-8";
            res.statusCode = upstream.ok ? 200 : 502;
            res.setHeader("Content-Type", ct);
            res.end(text);
          })
          .catch((err: unknown) => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const msg = err instanceof Error ? err.message : String(err);
            res.end(JSON.stringify({ error: msg }));
          });
      });
    },
  };
}
