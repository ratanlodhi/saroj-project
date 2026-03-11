import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ExternalLink, Plus, Edit, Trash2, Settings } from 'lucide-react';
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

const videos = [
  {
    id: '1',
    title: 'Abstract Painting Process',
    description: 'Watch the creation of "Whispers of Dawn" from first brushstroke to completion.',
    thumbnail: '/gallery/abstract-1.jpg',
    duration: '12:34',
  },
  {
    id: '2',
    title: 'Portrait Study Timelapse',
    description: 'A mesmerizing timelapse of classical portrait techniques in action.',
    thumbnail: '/gallery/portrait-1.jpg',
    duration: '8:45',
  },
  {
    id: '3',
    title: 'Studio Tour',
    description: 'An intimate look inside the  workspace.',
    thumbnail: '/gallery/realism-1.jpg',
    duration: '15:20',
  },
  {
    id: '4',
    title: 'Color Mixing Masterclass',
    description: 'Learn the secrets of creating harmonious color palettes.',
    thumbnail: '/gallery/abstract-2.jpg',
    duration: '22:15',
  },
];

// Static external articles (existing)
const externalArticles = [
  {
    id: 'ext-1',
    title: 'Saroj Prakash Bandi Explores Memory and Silence by Capturing the Essence of Forgotten Spaces',
    source: 'abirpothi.com',
    description: 'Saroj Prakash Bandi, a talented artist from India, delves into the depths of memory and silence through his evocative artworks, capturing the essence of forgotten spaces.',
    url: 'https://www.abirpothi.com/saroj-prakash-bandi-explores-memory-and-silence-by-capturing-the-essence-of-forgotten-spaces/',
    thumbnail: '/media/abirpothi-article.jpg',
  },
  {
    id: 'ext-2',
    title: 'Artist Feature - Latest Works',
    source: 'instagram.com',
    description: 'Explore the latest artwork showcase featuring new pieces and creative process insights.',
    url: 'https://www.instagram.com/p/DFb9URgyFPr/?igsh=eXQwOHZwemYwdjRl',
    thumbnail: '/gallery/soft-pastel-1.jpg',
  },
];

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  published_at: string;
  slug: string;
  source: string | null;
  external_url: string | null;
}

export default function MediaPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

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

    setArticles(articles.filter(a => a.id !== id));
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
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="py-12 md:py-20">
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
      </section>

      {/* Featured Video */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-sm overflow-hidden shadow-elegant group cursor-pointer">
              <img
                src="/gallery/abstract-1.jpg"
                alt="Featured video thumbnail"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                  <Play size={32} className="text-accent-foreground ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="text-xs tracking-widest uppercase text-cream/70 font-sans">Featured</span>
                <h2 className="font-serif text-2xl md:text-3xl text-cream mt-2">
                  The Art of Abstract Expression
                </h2>
                <p className="text-cream/80 text-sm mt-2 max-w-lg">
                  A documentary exploring the philosophy and technique behind our abstract work.
                </p>
              </div>
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
            {videos.map((video, index) => (
              <article
                key={video.id}
                className="group cursor-pointer animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-video rounded-sm overflow-hidden shadow-elegant">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-accent/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={24} className="text-accent-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-charcoal/80 px-2 py-1 rounded text-xs text-cream font-sans">
                    {video.duration}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-serif text-lg text-primary group-hover:text-accent transition-colors">
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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Internal articles from database */}
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className="group block animate-fade-up relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
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

              {/* External articles (static) */}
              {externalArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block animate-fade-up"
                  style={{ animationDelay: `${(articles.length + index) * 100}ms` }}
                >
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                    <div className="px-4 py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Link</span>
                    </div>
                    
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300 flex items-center justify-center">
                        <ExternalLink 
                          size={32} 
                          className="text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-card">
                      <h3 className="font-serif text-base md:text-lg text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-sans mt-2 line-clamp-2">
                        {article.description}
                      </p>
                      <p className="text-muted-foreground/70 text-xs font-sans mt-2">
                        {article.source}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Coming Soon</span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mt-4 mb-4">
            More Content on the Way
          </h2>
          <p className="text-muted-foreground font-sans max-w-md mx-auto">
            Subscribe to our newsletter to be notified when new videos and articles are released.
          </p>
        </div>
      </section>
    </div>
  );
}
