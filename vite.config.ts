import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { devBlogspotFeedPlugin } from "./vite-plugin-dev-blogspot-feed";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const blogspotFeedUrl =
    env.VITE_BLOGSPOT_FEED_URL ||
    "https://sarojprakashbandi.blogspot.com/feeds/posts/default?alt=rss";
  const supabaseUrl =
    env.VITE_SUPABASE_URL || "https://dcrfsaggvdfjjvinryxt.supabase.co";
  const supabaseAnon =
    env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    (supabaseUrl.includes("dcrfsaggvdfjjvinryxt.supabase.co")
      ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcmZzYWdndmRmamp2aW5yeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk2NjcsImV4cCI6MjA4NDk4NTY2N30.3jwSRMODQSYLGar9uxxeCJ21FYV6Mo-c6gEEbgawwAA"
      : "");

  return {
  server: {
    host: "::",
    port: 8080,
    /** Same-origin fetch in dev: browser avoids Supabase CORS preflight; proxy adds anon headers. */
    proxy: {
      "/functions/v1": {
        target: supabaseUrl,
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            if (supabaseAnon) {
              proxyReq.setHeader("Authorization", `Bearer ${supabaseAnon}`);
              proxyReq.setHeader("apikey", supabaseAnon);
            }
          });
        },
      },
    },
  },
  plugins: [
    mode === "development" && devBlogspotFeedPlugin(blogspotFeedUrl),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
