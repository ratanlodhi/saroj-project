import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Send } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/article-editor/RichTextEditor';
import { CoverImageUpload } from '@/components/article-editor/CoverImageUpload';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading, roleResolved } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    if (!loading && (!user || (roleResolved && !isAdmin))) {
      navigate('/auth');
    }
  }, [user, isAdmin, roleResolved, loading, navigate]);

  useEffect(() => {
    if (isEditing) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load article',
        variant: 'destructive',
      });
      navigate('/media');
      return;
    }

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle || '');
      setContent(data.content);
      setCoverImage(data.cover_image_url);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file, { upsert: false, cacheControl: '3600' });

    if (uploadError) {
      toast({
        title: 'Upload Failed',
        description: uploadError.message || 'Storage bucket may not exist or policy is missing. Check Supabase Storage.',
        variant: 'destructive',
      });
      console.error('[ArticleEditor] upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleCoverUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      setCoverImage(url);
    }
    return url;
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please add a title and content',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);

    const slug = slugify(title) + '-' + Date.now().toString(36);

    const articleData = {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      content,
      cover_image_url: coverImage,
      author_id: user?.id,
      slug,
      source: 'Internal',
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          title: articleData.title,
          subtitle: articleData.subtitle,
          content: articleData.content,
          cover_image_url: articleData.cover_image_url,
        })
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('articles')
        .insert(articleData);
      error = insertError;
    }

    setIsPublishing(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: isEditing ? 'Article updated!' : 'Article published!',
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

  if (showPreview) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setShowPreview(false)} className="gap-2">
              <ArrowLeft size={18} />
              Back to Editor
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="gap-2">
              <Send size={18} />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>

          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full aspect-[21/9] object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="font-serif text-4xl md:text-5xl font-medium text-primary mb-4">
            {title || 'Untitled Article'}
          </h1>

          {subtitle && (
            <p className="text-xl text-muted-foreground mb-8">{subtitle}</p>
          )}

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/media')} className="gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
              <Eye size={18} />
              Preview
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="gap-2">
              <Send size={18} />
              {isPublishing ? 'Publishing...' : isEditing ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <CoverImageUpload
            coverImage={coverImage}
            onUpload={handleCoverUpload}
            onRemove={() => setCoverImage(null)}
          />
        </div>

        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title"
          className="text-3xl md:text-4xl font-serif font-medium border-0 border-b rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-accent bg-transparent placeholder:text-muted-foreground/50"
        />

        {/* Subtitle */}
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Add a subtitle (optional)"
          className="text-xl text-muted-foreground border-0 border-b rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:border-accent bg-transparent placeholder:text-muted-foreground/40 mt-4"
        />

        {/* Rich Text Editor */}
        <div className="mt-8">
          <RichTextEditor
            content={content}
            onChange={setContent}
            onImageUpload={uploadImage}
          />
        </div>
      </div>
    </div>
  );
}
