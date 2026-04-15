import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, FileText, UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  author_id: string;
  author_name?: string;
  published_at: string;
  cover_image_url: string | null;
  slug: string;
  source: string | null;
}

export default function ArticleManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editAuthorArticle, setEditAuthorArticle] = useState<Article | null>(null);
  const [editAuthorName, setEditAuthorName] = useState('');
  const [savingAuthor, setSavingAuthor] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, subtitle, author_id, published_at, cover_image_url, slug, source')
      .order('published_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load articles',
        variant: 'destructive',
      });
    } else {
      const authorIds = [...new Set((data || []).map(article => article.author_id))];

      if (authorIds.length === 0) {
        setArticles(data || []);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', authorIds);

      const profileById = new Map(
        (profiles || []).map(profile => [
          profile.id,
          profile.display_name || 'Saroj Prakash Bandi',
        ]),
      );

      const normalized = (data || []).map(article => ({
        ...article,
        author_name: profileById.get(article.author_id) || 'Saroj Prakash Bandi',
      }));

      setArticles(normalized);
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

    setArticles(prev => prev.filter(a => a.id !== id));
    toast({
      title: 'Deleted',
      description: 'Article deleted successfully',
    });
  };

  const openEditAuthor = (article: Article) => {
    setEditAuthorArticle(article);
    setEditAuthorName(article.author_name || '');
  };

  const handleSaveAuthor = async () => {
    if (!editAuthorArticle) return;
    setSavingAuthor(true);

    const { error } = await supabase
      .from('articles')
      .update({ author_name: editAuthorName.trim() || 'Admin' } as any)
      .eq('id', editAuthorArticle.id);

    setSavingAuthor(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setArticles(prev =>
      prev.map(a =>
        a.id === editAuthorArticle.id
          ? { ...a, author_name: editAuthorName.trim() || 'Admin' }
          : a,
      ),
    );
    toast({ title: 'Saved', description: 'Author name updated.' });
    setEditAuthorArticle(null);
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.author_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="pl-10"
          />
        </div>
        <Button onClick={() => navigate('/article/new')} className="gap-2 shrink-0">
          <Plus size={16} />
          New Article
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center min-w-[120px]">
          <FileText className="mx-auto text-accent mb-2" size={24} />
          <div className="text-2xl font-serif font-medium text-primary">{articles.length}</div>
          <div className="text-sm text-muted-foreground">Total Articles</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-muted-foreground mb-4" size={40} />
            <p className="text-muted-foreground">
              {searchQuery ? 'No articles match your search' : 'No articles yet. Create your first one!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/article/new')} className="mt-4 gap-2">
                <Plus size={16} />
                Create Article
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <div className="min-w-[640px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map(article => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {article.cover_image_url ? (
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <FileText size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-primary line-clamp-1 max-w-xs">
                          {article.title}
                        </div>
                        {article.subtitle && (
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                            {article.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openEditAuthor(article)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
                      title="Click to edit author name"
                    >
                      <span>{article.author_name || 'Saroj Prakash Bandi'}</span>
                      <UserPen size={13} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </TableCell>
                  <TableCell>
                    {article.source ? (
                      <Badge variant="secondary">{article.source}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(article.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => navigate(`/article/edit/${article.id}`)}
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            disabled={deletingId === article.id}
                          >
                            <Trash2 size={14} />
                            {deletingId === article.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{article.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          </div>
        )}
      </div>
      {/* Edit Author Name Dialog */}
      <Dialog open={!!editAuthorArticle} onOpenChange={open => !open && setEditAuthorArticle(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-sm p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Author Name</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="author-name-input">Author Name</Label>
            <Input
              id="author-name-input"
              value={editAuthorName}
              onChange={e => setEditAuthorName(e.target.value)}
              placeholder="e.g. Saroj Prakash"
              onKeyDown={e => e.key === 'Enter' && handleSaveAuthor()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAuthorArticle(null)}>Cancel</Button>
            <Button onClick={handleSaveAuthor} disabled={savingAuthor}>
              {savingAuthor ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
