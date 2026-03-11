import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Artwork {
  id: string;
  title: string;
  medium: string;
  size: string;
  year: string;
  description: string;
  image_url: string;
  image?: string;
  featured?: boolean;
  price: number;
  artist_id?: string;
  artist?: string;
  artist_location?: string;
  artistLocation?: string;
  sold?: boolean;
  category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

type ArtworkMutationInput = Omit<Artwork, 'id' | 'created_at' | 'updated_at'>;

// Fallback mock data in case Supabase is unavailable
const MOCK_ARTWORKS: Artwork[] = [
  {
    id: '1a19d408-fdc5-46d8-b12b-0922f6d7ce31',
    title: 'Acrylic 1',
    medium: 'Acrylic on Canvas',
    size: '30 × 30 cm',
    year: '2024',
    description: 'A vibrant acrylic painting showcasing bold colors and expressive brushwork.',
    image_url: '/gallery/acrylic-1.jpg',
    image: '/gallery/acrylic-1.jpg',
    featured: true,
    price: 12500,
    artist: 'Your Artist Name',
    sold: false,
  },
  {
    id: '436fb657-26a0-4e47-a18a-3d4623fd35e2',
    title: 'Acrylic 3',
    medium: 'Acrylic on Canvas',
    size: '30 × 30 cm',
    year: '2024',
    description: 'A vibrant acrylic painting showcasing bold colors and expressive brushwork.',
    image_url: '/gallery/acrylic-3.jpg',
    image: '/gallery/acrylic-3.jpg',
    featured: true,
    price: 18200,
    artist: 'Your Artist Name',
    sold: false,
  },
  {
    id: '3bf87b88-7ee8-4bd1-ae3e-2519d5a4db14',
    title: 'Acrylic 7',
    medium: 'Acrylic on Canvas',
    size: '30 × 30 cm',
    year: '2024',
    description: 'A vibrant acrylic painting showcasing bold colors and expressive brushwork.',
    image_url: '/gallery/acrylic-7.jpg',
    image: '/gallery/acrylic-7.jpg',
    featured: true,
    price: 29800,
    artist: 'Your Artist Name',
    sold: false,
  },
];

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const normalizeArtwork = (artwork: any): Artwork => ({
    ...artwork,
    image_url: artwork?.image_url || artwork?.image || '',
    image: artwork?.image_url || artwork?.image || '',
    artist: artwork?.artist || 'Unknown Artist',
    artist_location: artwork?.artist_location || artwork?.artistLocation || '',
    artistLocation: artwork?.artistLocation || artwork?.artist_location || '',
  });

  const sanitizeArtworkPayload = <T extends Partial<ArtworkMutationInput>>(artwork: T): T => {
    const payload = { ...artwork } as Record<string, any>;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if ('title' in payload) payload.title = (payload.title || '').trim();
    if ('medium' in payload) payload.medium = (payload.medium || '').trim();
    if ('size' in payload) payload.size = (payload.size || '').trim();
    if ('year' in payload) payload.year = (payload.year || '').trim();
    if ('description' in payload) payload.description = (payload.description || '').trim();
    if ('image_url' in payload) payload.image_url = (payload.image_url || '').trim();
    if ('price' in payload) {
      const parsedPrice = Number(payload.price);
      payload.price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
    }
    if ('featured' in payload) payload.featured = Boolean(payload.featured);
    if ('sold' in payload) payload.sold = Boolean(payload.sold);
    if ('artist_id' in payload) {
      const artistId = typeof payload.artist_id === 'string' ? payload.artist_id.trim() : '';
      if (!artistId || !uuidRegex.test(artistId)) {
        delete payload.artist_id;
      } else {
        payload.artist_id = artistId;
      }
    }

    if ('category_id' in payload) {
      const categoryId = typeof payload.category_id === 'string' ? payload.category_id.trim() : '';
      if (!categoryId || !uuidRegex.test(categoryId)) {
        payload.category_id = null;
      } else {
        payload.category_id = categoryId;
      }
    }

    return payload as T;
  };

  const getSupabaseErrorMessage = (err: any, fallback: string) =>
    err?.message || err?.details || err?.hint || fallback;

  const fetchArtworks = async () => {
    setLoading(true);
    setIsOffline(false);
    
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const transformedData = data.map(normalizeArtwork);
        setArtworks(transformedData);

        if (transformedData.length === 0) {
          toast({
            title: 'No artworks in database',
            description: 'The artworks query returned 0 rows. Check RLS SELECT policy and table data.',
            variant: 'default',
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching artworks:', err?.message);
      
      // Use mock data as fallback
      setArtworks(MOCK_ARTWORKS);
      setIsOffline(true);
      
      toast({
        title: 'Offline Mode',
        description: 'Unable to connect to Supabase. Showing sample artworks.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const createArtwork = async (artwork: ArtworkMutationInput) => {
    try {
      const payload = sanitizeArtworkPayload(artwork);

      const { data, error } = await supabase
        .from('artworks')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const normalizedArtwork = normalizeArtwork(data);
      setArtworks(prev => [normalizedArtwork, ...prev]);
      toast({
        title: 'Success',
        description: 'Artwork created successfully',
      });
      return normalizedArtwork;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: getSupabaseErrorMessage(err, 'Failed to create artwork'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateArtwork = async (id: string, updates: Partial<ArtworkMutationInput>) => {
    try {
      const payload = sanitizeArtworkPayload(updates);

      const { data, error } = await supabase
        .from('artworks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const normalizedArtwork = normalizeArtwork(data);
      setArtworks(prev => prev.map(artwork =>
        artwork.id === id ? normalizedArtwork : artwork
      ));
      toast({
        title: 'Success',
        description: 'Artwork updated successfully',
      });
      return normalizedArtwork;
    } catch (err: any) {
      console.error('Failed to update artwork', { id, payload: updates, error: err });
      toast({
        title: 'Error',
        description: getSupabaseErrorMessage(err, 'Failed to update artwork'),
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArtworks(prev => prev.filter(artwork => artwork.id !== id));
      toast({
        title: 'Success',
        description: 'Artwork deleted successfully',
      });
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete artwork',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchArtworks();

    const channel = supabase
      .channel('artworks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => {
          // Keep all hook instances in sync after admin CRUD operations.
          fetchArtworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    artworks,
    loading,
    isOffline,
    fetchArtworks,
    createArtwork,
    updateArtwork,
    deleteArtwork,
  };
}
