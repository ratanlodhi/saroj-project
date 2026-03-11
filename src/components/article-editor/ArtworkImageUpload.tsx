import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface ArtworkImageUploadProps {
  onImageUpload?: (imageUrl: string) => void;
  artworkId?: string;
}

export function ArtworkImageUpload({ onImageUpload, artworkId }: ArtworkImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB in bytes

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size immediately when the user selects a file.
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File size must be 15 MB or less.',
        variant: 'destructive',
      });
      e.target.value = '';
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Upload to Supabase Storage only after user confirms.
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const filePath = `artworks/${fileName}`;

      const { data, error } = await supabase.storage
        .from('artworks')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Update artwork record if artworkId is provided
      if (artworkId) {
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ image_url: imageUrl })
          .eq('id', artworkId);

        if (updateError) throw updateError;
      }

      onImageUpload?.(imageUrl);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      const rawMessage = String(err?.message || '');
      const isSizeError =
        /payload too large|file size|maximum allowed/i.test(rawMessage) ||
        err?.statusCode === '413';

      toast({
        title: 'Error',
        description: isSizeError
          ? 'File size must be 15 MB or less.'
          : err.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <label htmlFor="artwork-image" className="text-sm font-medium">
          Upload Artwork Image
        </label>
        <Input
          id="artwork-image"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">Max image size: 15 MB</p>
      </div>

      {preview && (
        <div className="relative w-full max-w-md">
          <img
            src={preview}
            alt="Preview"
            className="rounded-lg object-cover w-full h-64 border border-border"
          />
        </div>
      )}

      {selectedFile && (
        <Button type="button" onClick={handleUpload} disabled={uploading} className="w-fit">
          {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Upload Image
        </Button>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
