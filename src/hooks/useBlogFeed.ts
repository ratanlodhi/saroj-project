import { useState, useEffect } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  author: string;
}

interface UseBlogFeedState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
}

function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    'https://dcrfsaggvdfjjvinryxt.supabase.co'
  );
}

/** Mirrors integrations/supabase/client fallbacks so the functions gateway accepts requests. */
function getSupabaseAnonKey(): string {
  const fromEnv =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (fromEnv) return fromEnv;
  const url = getSupabaseUrl();
  if (url.includes('dcrfsaggvdfjjvinryxt.supabase.co')) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcmZzYWdndmRmamp2aW5yeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk2NjcsImV4cCI6MjA4NDk4NTY2N30.3jwSRMODQSYLGar9uxxeCJ21FYV6Mo-c6gEEbgawwAA';
  }
  return '';
}

/**
 * Blog RSS: production → Supabase Edge Function `blogspot-feed`.
 * Dev → same-origin `/dev/blogspot-feed` (Vite plugin fetches RSS in Node; no deployment needed).
 *
 * Override anytime with VITE_BLOG_FEED_API_URL.
 */
function blogFeedFetchUrl(): string {
  const custom = import.meta.env.VITE_BLOG_FEED_API_URL as string | undefined;
  if (custom) return custom;
  if (import.meta.env.DEV) {
    return '/dev/blogspot-feed';
  }
  return `${getSupabaseUrl()}/functions/v1/blogspot-feed`;
}

function parseRssXml(text: string): BlogPost[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'application/xml');

  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Failed to parse RSS feed');
  }

  const entries = xmlDoc.querySelectorAll('entry, item');
  const posts: BlogPost[] = [];

  entries.forEach((entry) => {
    try {
      const title =
        entry.querySelector('title')?.textContent ||
        entry.querySelector('h3')?.textContent ||
        'Untitled';
      const link =
        entry.querySelector('link')?.getAttribute('href') ||
        entry.querySelector('link')?.textContent ||
        '';
      const published =
        entry.querySelector('published')?.textContent ||
        entry.querySelector('pubDate')?.textContent ||
        new Date().toISOString();
      const content =
        entry.querySelector('content')?.textContent ||
        entry.querySelector('description')?.textContent ||
        entry.querySelector('summary')?.textContent ||
        '';

      const author =
        entry.querySelector('author')?.querySelector('name')?.textContent ||
        entry.querySelector('author')?.textContent ||
        'Unknown Author';

      let image = '';
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
      } else {
        const mediaContent = entry.querySelector('media\\:content');
        if (mediaContent) {
          image = mediaContent.getAttribute('url') || '';
        } else {
          const mediaThumb = entry.querySelector('media\\:thumbnail');
          if (mediaThumb) {
            image = mediaThumb.getAttribute('url') || '';
          }
        }
      }

      const cleanContent = content.replace(/<[^>]*>/g, '');
      const excerpt =
        cleanContent.slice(0, 150).trim() +
        (cleanContent.length > 150 ? '...' : '');

      if (title && published) {
        posts.push({
          id: link || title,
          title: title.trim(),
          excerpt: excerpt || title,
          content: cleanContent,
          date: new Date(published).toISOString().split('T')[0],
          image: image || '/gallery/abstract-1.jpg',
          author: author.trim(),
        });
      }
    } catch (e) {
      console.error('Error parsing entry:', e);
    }
  });

  return posts;
}

export function useBlogFeed(feedUrl?: string): UseBlogFeedState {
  const [state, setState] = useState<UseBlogFeedState>({
    posts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!feedUrl) {
      setState({
        posts: [],
        loading: false,
        error: 'No feed URL provided',
      });
      return;
    }

    const fetchBlogPosts = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const useDevProxy =
          import.meta.env.DEV && !import.meta.env.VITE_BLOG_FEED_API_URL;

        let init: RequestInit | undefined;
        if (!useDevProxy) {
          const h: Record<string, string> = {
            Accept: 'application/xml, text/xml, */*',
          };
          const anon = getSupabaseAnonKey();
          if (anon) {
            h.Authorization = `Bearer ${anon}`;
            h.apikey = anon;
          }
          init = { headers: h };
        }

        const response = await fetch(blogFeedFetchUrl(), init);

        const text = await response.text();

        if (!response.ok) {
          let detail = response.statusText;
          try {
            const j = JSON.parse(text) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* plain text body */
          }
          throw new Error(detail || `Failed to fetch feed: ${response.status}`);
        }

        if (text.trimStart().startsWith('{')) {
          const j = JSON.parse(text) as { error?: string };
          if (j.error) throw new Error(j.error);
        }

        const parsed = parseRssXml(text);
        const limitedPosts = parsed.slice(0, 10);

        setState({
          posts: limitedPosts,
          loading: false,
          error: limitedPosts.length === 0 ? 'No blog posts found in feed' : null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load blog posts';
        setState({
          posts: [],
          loading: false,
          error: errorMessage,
        });
      }
    };

    fetchBlogPosts();
  }, [feedUrl]);

  return state;
}
