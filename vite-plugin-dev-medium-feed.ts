import type { Plugin } from "vite";

const MEDIUM_FEED_DEFAULT = "https://sarojprakashbandi.medium.com/feed";

/**
 * In dev, GET /dev/medium-feed returns raw Medium RSS XML from Node (no CORS).
 * useMediumPosts parses it in the browser — same pattern as dev-blogspot-feed.
 */
export function devMediumFeedPlugin(
  feedUrl: string = MEDIUM_FEED_DEFAULT,
): Plugin {
  return {
    name: "dev-medium-feed",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }
        const path = req.url?.split("?")[0] ?? "";
        if (path !== "/dev/medium-feed") {
          next();
          return;
        }

        void fetch(feedUrl, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; ViteDevMediumFeed/1.0; +https://github.com)",
            Accept:
              "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
            "Accept-Language": "en-US,en;q=0.9",
          },
        })
          .then(async (upstream) => {
            const text = await upstream.text();
            const ct =
              upstream.headers.get("content-type") ??
              "application/rss+xml; charset=utf-8";
            res.statusCode = upstream.status;
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
