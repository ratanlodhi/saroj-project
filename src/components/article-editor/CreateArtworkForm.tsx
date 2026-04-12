import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Artwork } from '@/hooks/useArtworks';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArtworkImageUpload } from './ArtworkImageUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';

interface CreateArtworkFormProps {
  onArtworkCreated?: (artwork: Artwork) => void;
}

export function CreateArtworkForm({ onArtworkCreated }: CreateArtworkFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    medium: '',
    size: '',
    year: new Date().getFullYear().toString(),
    description: '',
    price: 0,
    featured: false,
    sold: false,
  });
  const { toast } = useToast();
  const { categories } = useCategories();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create an artwork');
      }

      const artworkData = {
        title: formData.title,
        medium: formData.medium,
        size: formData.size,
        year: formData.year,
        description: formData.description,
        price: formData.price,
        featured: formData.featured,
        sold: formData.sold,
        image_url: imageUrl,
        artist_id: user.id,
        category_id: categoryId || null,
      };

      const { data, error } = await supabase
        .from('artworks')
        .insert([artworkData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Artwork created successfully!',
      });

      onArtworkCreated?.(data);

      // Reset form
      setFormData({
        title: '',
        medium: '',
        size: '',
        year: new Date().getFullYear().toString(),
        description: '',
        price: 0,
        featured: false,
        sold: false,
      });
      setImageUrl('');
      setCategoryId('');
      setOpen(false);
    } catch (err: any) {
      console.error('Error creating artwork:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create artwork',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Artwork
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Artwork</DialogTitle>
          <DialogDescription>
            Add a new artwork to your gallery with an image
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ArtworkImageUpload onImageUpload={setImageUrl} />

          {imageUrl && (
            <div className="text-sm text-green-600">
              ✓ Image uploaded: {imageUrl}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Medium</label>
              <Input
                name="medium"
                value={formData.medium}
                onChange={handleInputChange}
                placeholder="e.g., Acrylic on Canvas"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Sunset Reflections"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Size</label>
              <Input
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., 30 × 30 cm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Year</label>
              <Input
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="2024"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Price (₹)</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium">Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="sold"
                  checked={formData.sold}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      sold: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium">Mark as not available for sale</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your artwork..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !imageUrl}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Artwork
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
