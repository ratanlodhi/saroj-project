import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Edit, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  author_name?: string;
  published_at: string;
  slug: string;
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      navigate('/media');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', data.author_id)
      .single();

    setArticle({
      ...data,
      author_name: profile?.display_name || 'Saroj Prakash Bandi',
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!article) return;
    
    setIsDeleting(true);
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', article.id);

    setIsDeleting(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete article',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Article deleted successfully',
    });

    navigate('/media');
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen pb-20">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/media')} className="gap-2">
            <ArrowLeft size={18} />
            Back to Media
          </Button>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <Link to={`/article/edit/${article.id}`}>
                  <Edit size={16} />
                  Edit
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the article.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="aspect-[21/9] rounded-lg overflow-hidden mb-8">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl md:text-2xl text-muted-foreground mt-4">
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author_name || 'Saroj Prakash Bandi'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="section-divider mt-8" />
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-foreground/90 prose-a:text-accent prose-blockquote:border-accent prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
        />
      </article>
    </div>
  );
}
