import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';
import {
  MEDIA_FEATURED_VIDEO,
  MEDIA_MORE_VIDEOS,
} from '@/data/mediaVideos';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  author_name: string;
  published_at: string;
  slug: string;
  source: string | null;
  external_url: string | null;
}

/** Single query — author_name is already stored on the articles row. */
async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, subtitle, content, cover_image_url, author_id, author_name, published_at, slug, source, external_url')
    .order('published_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Article[];
}

/** Skeleton card matching the existing article card shape. */
function ArticleSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="px-4 py-2 border-b border-border/50">
        <div className="h-3 w-10 bg-muted rounded" />
      </div>
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5 mt-1" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export default function MediaPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: articles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Article[], Error>({
    queryKey: ['press-articles'],
    queryFn: fetchArticles,
    staleTime: 2 * 60 * 1000,  // treat as fresh for 2 minutes — re-visits are instant
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    setDeletingId(null);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
      return;
    }

    // Optimistically remove from cache — no refetch needed
    queryClient.setQueryData<Article[]>(['press-articles'], (prev) =>
      (prev ?? []).filter((a) => a.id !== id),
    );
    toast({
      title: 'Deleted',
      description: 'Article deleted successfully',
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      {/* <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Videos & More</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Media
          </h1>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Go behind the scenes with process videos, studio tours, and artistic insights.
          </p>
          <div className="section-divider mt-8" />
        </div>
      </section> */}

      {/* Featured Video — YouTube embed (muted autoplay for browser policy compliance) */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-sm overflow-hidden shadow-elegant bg-charcoal">
              <YouTubeEmbed
                videoId={MEDIA_FEATURED_VIDEO.youtubeId}
                title={MEDIA_FEATURED_VIDEO.title}
                autoplay
                lazy={false}
              />
            </div>
            <div className="mt-6">
              <span className="text-xs tracking-widest uppercase text-accent font-sans">
                Featured
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-primary mt-2">
                {MEDIA_FEATURED_VIDEO.title}
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-lg">
                {MEDIA_FEATURED_VIDEO.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-8 text-center">
            More Videos
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {MEDIA_MORE_VIDEOS.map((video, index) => (
              <article
                key={video.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video rounded-sm overflow-hidden shadow-elegant bg-charcoal">
                  <YouTubeEmbed
                    videoId={video.youtubeId}
                    title={video.title}
                    autoplay
                    lazy
                  />
                </div>

                <div className="mt-4">
                  <h3 className="font-serif text-lg text-primary">
                    {video.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-sans mt-1">
                    {video.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Articles */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary text-center flex-1">
              Press & Articles
            </h2>
            {isAdmin && (
              <div className="flex gap-2">
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/admin">
                    <Settings size={18} />
                    Manage Admins
                  </Link>
                </Button>
                <Button asChild className="gap-2">
                  <Link to="/article/new">
                    <Plus size={18} />
                    Write Article
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Database Articles */}
          {isError ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Unable to load articles: {error?.message}</p>
              <button onClick={() => refetch()} className="mt-3 text-sm text-accent underline">Retry</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Skeleton placeholders while loading */}
              {isLoading && (
                <>
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                </>
              )}

              {/* Articles from database */}
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className="group block animate-fade-up relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {article.external_url ? (
                    <a href={article.external_url} target="_blank" rel="noopener noreferrer">
                      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                        <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Link</span>
                          <ExternalLink size={14} className="text-muted-foreground" />
                        </div>

                        <div className="relative aspect-[16/9] overflow-hidden">
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No cover image</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-card">
                          <h3 className="font-serif text-base md:text-lg text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm font-sans mt-2 line-clamp-2">
                            {article.subtitle || stripHtml(article.content).substring(0, 120) + '...'}
                          </p>
                          <p className="text-muted-foreground/70 text-xs font-sans mt-2">
                            By {article.author_name} • {new Date(article.published_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <Link to={`/article/${article.slug}`}>
                      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                        <div className="px-4 py-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Article</span>
                        </div>

                        <div className="relative aspect-[16/9] overflow-hidden">
                          {article.cover_image_url ? (
                            <img
                              src={article.cover_image_url}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No cover image</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-card">
                          <h3 className="font-serif text-base md:text-lg text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm font-sans mt-2 line-clamp-2">
                            {article.subtitle || stripHtml(article.content).substring(0, 120) + '...'}
                          </p>
                          <p className="text-muted-foreground/70 text-xs font-sans mt-2">
                            By {article.author_name} • {new Date(article.published_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="absolute top-12 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <Link to={`/article/edit/${article.id}`}>
                          <Edit size={14} />
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(article.id)}
                              disabled={deletingId === article.id}
                            >
                              {deletingId === article.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
