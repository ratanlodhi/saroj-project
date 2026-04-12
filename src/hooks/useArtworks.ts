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
  artist_profile?: {
    display_name?: string | null;
  } | null;
  artist_location?: string;
  artistLocation?: string;
  sold?: boolean;
  category_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Price & Details fields
  status?: string;
  quantity?: number;
  commission_percentage?: number;
  packaging_type?: string;
  shipping_weight?: number;
  number_of_panels?: number;
  ready_to_hang?: boolean;
  decorative_frame?: boolean;
}

type ArtworkMutationInput = Omit<Artwork, 'id' | 'created_at' | 'updated_at'>;

const ARTWORKS_CACHE_KEY = 'artworks_cache_v1';
const ARTWORKS_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const EXPECTED_SUPABASE_REF = 'dcrfsaggvdfjjvinryxt';
const DEFAULT_SUPABASE_URL = `https://${EXPECTED_SUPABASE_REF}.supabase.co`;
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcmZzYWdndmRmamp2aW5yeXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDk2NjcsImV4cCI6MjA4NDk4NTY2N30.3jwSRMODQSYLGar9uxxeCJ21FYV6Mo-c6gEEbgawwAA';
const ARTWORKS_SELECT = '*, artist_profile:profiles!artworks_artist_id_fkey(display_name)';

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const normalizeArtwork = (artwork: any): Artwork => {
    const profileArtistName =
      artwork?.artist_profile?.display_name ||
      artwork?.profiles?.display_name ||
      artwork?.profiles?.[0]?.display_name ||
      '';

    return {
      ...artwork,
      image_url: artwork?.image_url || artwork?.image || '',
      image: artwork?.image_url || artwork?.image || '',
      artist: artwork?.artist || profileArtistName || 'Unknown Artist',
      artist_location: artwork?.artist_location || artwork?.artistLocation || '',
      artistLocation: artwork?.artistLocation || artwork?.artist_location || '',
      // Price & Details with defaults
      status: artwork?.status || 'For Sale',
      quantity: artwork?.quantity ?? 1,
      commission_percentage: artwork?.commission_percentage ?? 15,
      packaging_type: artwork?.packaging_type || 'Tube',
      shipping_weight: artwork?.shipping_weight ?? 0,
      number_of_panels: artwork?.number_of_panels ?? 1,
      ready_to_hang: artwork?.ready_to_hang ?? false,
      decorative_frame: artwork?.decorative_frame ?? false,
    };
  };

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

    // Sanitize new Price & Details fields
    if ('status' in payload) payload.status = (payload.status || '').trim() || 'For Sale';
    if ('quantity' in payload) {
      const parsedQuantity = Number(payload.quantity);
      payload.quantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
    }
    if ('commission_percentage' in payload) {
      const parsedCommission = Number(payload.commission_percentage);
      payload.commission_percentage = Number.isFinite(parsedCommission) ? parsedCommission : 15;
    }
    if ('packaging_type' in payload) payload.packaging_type = (payload.packaging_type || '').trim() || 'Tube';
    if ('shipping_weight' in payload) {
      const parsedWeight = Number(payload.shipping_weight);
      payload.shipping_weight = Number.isFinite(parsedWeight) ? parsedWeight : 0;
    }
    if ('number_of_panels' in payload) {
      const parsedPanels = Number(payload.number_of_panels);
      payload.number_of_panels = Number.isFinite(parsedPanels) && parsedPanels > 0 ? parsedPanels : 1;
    }
    if ('ready_to_hang' in payload) payload.ready_to_hang = Boolean(payload.ready_to_hang);
    if ('decorative_frame' in payload) payload.decorative_frame = Boolean(payload.decorative_frame);

    return payload as T;
  };

  const getSupabaseErrorMessage = (err: any, fallback: string) =>
    err?.message || err?.details || err?.hint || fallback;

  const readCachedArtworks = (): Artwork[] | null => {
    try {
      const raw = localStorage.getItem(ARTWORKS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { timestamp: number; data: Artwork[] };
      if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;
      if (Date.now() - parsed.timestamp > ARTWORKS_CACHE_MAX_AGE_MS) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  const writeCachedArtworks = (data: Artwork[]) => {
    try {
      localStorage.setItem(
        ARTWORKS_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch {
      // Ignore storage write failures.
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutLabel: string): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`${timeoutLabel} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };

  const fetchArtworksViaRest = async (timeoutMs = 5000) => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = envUrl && envUrl.includes(`${EXPECTED_SUPABASE_REF}.supabase.co`) ? envUrl : DEFAULT_SUPABASE_URL;
    const key =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      DEFAULT_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase REST fallback unavailable: missing env credentials');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const selectParams = new URLSearchParams({
        select: ARTWORKS_SELECT,
      });
      
      const response = await fetch(
        `${url}/rest/v1/artworks?${selectParams.toString()}`,
        {
          method: 'GET',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`REST fallback failed (${response.status}): ${body}`);
      }

      const rows = await response.json();
      console.log('[useArtworks] fetchArtworks:rest-success', { rowCount: rows?.length ?? 0 });
      return rows as any[];
    } finally {
      clearTimeout(timer);
    }
  };

  const fetchArtworksViaSupabase = async (timeoutMs = 5000) => {
    const { data, error } = await withTimeout(
      supabase
        .from('artworks')
        .select(ARTWORKS_SELECT),
      timeoutMs,
      'supabase.from(artworks).select'
    );

    if (error) throw error;
    return (data || []) as any[];
  };

  const fetchArtworks = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setIsOffline(false);
    console.log('[useArtworks] fetchArtworks:start');
    
    try {
      const rows = await Promise.any([
        fetchArtworksViaRest(5000),
        fetchArtworksViaSupabase(5000),
      ]);

      const transformedData = rows.map(normalizeArtwork);
      setArtworks(transformedData);
      writeCachedArtworks(transformedData);

      console.log('[useArtworks] fetchArtworks:success', {
        rowCount: transformedData.length,
      });

      if (transformedData.length === 0) {
        toast({
          title: 'No artworks in database',
          description: 'The artworks query returned 0 rows. Add artworks in admin or check RLS policies.',
          variant: 'default',
        });
      }
    } catch (err: any) {
      console.error('Error fetching artworks:', err?.message);
      console.error('[useArtworks] fetchArtworks:error', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      });

      // Keep actual database state visible instead of silently masking errors with mock data.
      setArtworks([]);
      setIsOffline(true);
      
      toast({
        title: 'Failed to load artworks',
        description: getSupabaseErrorMessage(err, 'Unable to connect to Supabase or query artworks'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('[useArtworks] fetchArtworks:end');
    }
  };

  const createArtwork = async (artwork: ArtworkMutationInput) => {
    try {
      const payload = sanitizeArtworkPayload(artwork);

      const { data, error } = await supabase
        .from('artworks')
        .insert([payload])
        .select(ARTWORKS_SELECT)
        .single();

      if (error) throw error;

      const normalizedArtwork = normalizeArtwork(data);
      setArtworks(prev => {
        const next = [normalizedArtwork, ...prev];
        writeCachedArtworks(next);
        return next;
      });
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
        .select(ARTWORKS_SELECT)
        .single();

      if (error) throw error;

      const normalizedArtwork = normalizeArtwork(data);
      setArtworks(prev => {
        const next = prev.map(artwork =>
          artwork.id === id ? normalizedArtwork : artwork
        );
        writeCachedArtworks(next);
        return next;
      });
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

      setArtworks(prev => {
        const next = prev.filter(artwork => artwork.id !== id);
        writeCachedArtworks(next);
        return next;
      });
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
    const cached = readCachedArtworks();
    if (cached && cached.length > 0) {
      setArtworks(cached);
      setLoading(false);
      fetchArtworks(false);
    } else {
      fetchArtworks(true);
    }

    const channel = supabase
      .channel('artworks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => {
          // Keep all hook instances in sync after admin CRUD operations.
          fetchArtworks(false);
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
