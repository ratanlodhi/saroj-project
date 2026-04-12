import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Artwork } from '@/hooks/useArtworks';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateShippingByCountry,
  DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE,
  DEFAULT_SHIPPING_INSURANCE_PERCENTAGE,
  INTERNATIONAL_SHIPPING_STORAGE_KEY,
  SHIPPING_INSURANCE_STORAGE_KEY,
  normalizeShippingInsurancePercentage,
} from '@/data/shippingConfig';

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (artwork: Artwork) => Promise<void>;
  removeFromCart: (artworkId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  /** Uses delivery country at checkout; India = domestic % (default 0%), other countries = international % (default 15%). */
  getShippingCostForCountry: (country: string | null | undefined) => number;
  /** Cart only: always 0 — shipping is applied at checkout once a delivery address is chosen. */
  getShippingCost: () => number;
  getTotalWithShippingForCountry: (country: string | null | undefined) => number;
  getTotalWithShipping: () => number;
  getItemCount: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [domesticShippingPercentage, setDomesticShippingPercentage] = useState<number>(() => {
    const saved = localStorage.getItem(SHIPPING_INSURANCE_STORAGE_KEY);
    return saved === null
      ? DEFAULT_SHIPPING_INSURANCE_PERCENTAGE
      : normalizeShippingInsurancePercentage(saved);
  });
  const [internationalShippingPercentage, setInternationalShippingPercentage] = useState<number>(() => {
    const saved = localStorage.getItem(INTERNATIONAL_SHIPPING_STORAGE_KEY);
    return saved === null
      ? DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE
      : normalizeShippingInsurancePercentage(saved);
  });

  const db = supabase as any;

  const getOrCreateActiveCartId = useCallback(async (uid: string) => {
    const { data: existingCart, error: findError } = await db
      .from('carts')
      .select('id')
      .eq('user_id', uid)
      .eq('status', 'active')
      .maybeSingle();

    if (findError) throw findError;
    if (existingCart?.id) return existingCart.id as string;

    const { data: createdCart, error: createError } = await db
      .from('carts')
      .insert({ user_id: uid, status: 'active' })
      .select('id')
      .single();

    if (createError) throw createError;
    return createdCart.id as string;
  }, [db]);

  const loadCartFromDb = useCallback(async (uid: string) => {
    const cartId = await getOrCreateActiveCartId(uid);

    const { error: normalizeError } = await db
      .from('cart_items')
      .update({ quantity: 1 })
      .eq('cart_id', cartId);

    if (normalizeError) {
      console.warn('Failed to normalize cart quantities', normalizeError);
    }

    const { data, error } = await db
      .from('cart_items')
      .select('quantity, artwork_id, artworks(*, artist_profile:profiles!artworks_artist_id_fkey(display_name))')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const mappedItems: CartItem[] = (data || [])
      .filter((row: any) => row.artworks)
      .map((row: any) => ({
        // Prefer denormalized artworks.artist, then related profile display_name.
        artwork: {
          ...row.artworks,
          image: row.artworks.image_url,
          artist:
            row.artworks.artist ||
            row.artworks.artist_profile?.display_name ||
            row.artworks.profiles?.display_name ||
            row.artworks.profiles?.[0]?.display_name ||
            'Unknown Artist',
          artistLocation: row.artworks.artist_location || '',
        },
        quantity: 1,
      }));

    setItems(mappedItems);
  }, [db, getOrCreateActiveCartId]);

  const loadShippingSettings = useCallback(async () => {
    const { data, error } = await db
      .from('app_settings')
      .select('shipping_insurance_percentage, international_shipping_percentage')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load app shipping settings', error);
      return;
    }

    const domestic = normalizeShippingInsurancePercentage(data?.shipping_insurance_percentage);
    const international = normalizeShippingInsurancePercentage(
      data?.international_shipping_percentage ?? DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE
    );
    setDomesticShippingPercentage(domestic);
    setInternationalShippingPercentage(international);
    localStorage.setItem(SHIPPING_INSURANCE_STORAGE_KEY, String(domestic));
    localStorage.setItem(INTERNATIONAL_SHIPPING_STORAGE_KEY, String(international));
  }, [db]);

  useEffect(() => {
    loadShippingSettings();
  }, [loadShippingSettings]);

  useEffect(() => {
    const syncFromStorage = () => {
      const domesticSaved = localStorage.getItem(SHIPPING_INSURANCE_STORAGE_KEY);
      const intlSaved = localStorage.getItem(INTERNATIONAL_SHIPPING_STORAGE_KEY);
      setDomesticShippingPercentage(
        domesticSaved === null
          ? DEFAULT_SHIPPING_INSURANCE_PERCENTAGE
          : normalizeShippingInsurancePercentage(domesticSaved)
      );
      setInternationalShippingPercentage(
        intlSaved === null
          ? DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE
          : normalizeShippingInsurancePercentage(intlSaved)
      );
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('shipping-settings-updated', syncFromStorage as EventListener);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('shipping-settings-updated', syncFromStorage as EventListener);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        try {
          await loadCartFromDb(uid);
        } catch (error) {
          console.error('Failed to load cart', error);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);

      if (!uid) {
        setItems([]);
        return;
      }

      try {
        await loadCartFromDb(uid);
      } catch (error) {
        console.error('Failed to sync cart on auth state change', error);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadCartFromDb]);

  const addToCart = async (artwork: Artwork) => {
    if (!userId) {
      setItems((prev) => {
        const existingItem = prev.find((item) => item.artwork.id === artwork.id);
        if (existingItem) {
          return prev;
        }
        return [...prev, { artwork, quantity: 1 }];
      });
      setIsCartOpen(true);
      return;
    }

    try {
      const cartId = await getOrCreateActiveCartId(userId);
      const { data: existing, error: existingError } = await db
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('artwork_id', artwork.id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing?.id) {
        const { error: updateError } = await db
          .from('cart_items')
          .update({ quantity: 1 })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await db.from('cart_items').insert({
          cart_id: cartId,
          artwork_id: artwork.id,
          quantity: 1,
          unit_price: artwork.price,
        });
        if (insertError) throw insertError;
      }

      await loadCartFromDb(userId);
      setIsCartOpen(true);
      return;
    } catch (error) {
      console.error('Failed to add item to cart', error);
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.artwork.id === artwork.id);
      if (existingItem) {
        return prev;
      }
      return [...prev, { artwork, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = async (artworkId: string) => {
    if (userId) {
      try {
        const cartId = await getOrCreateActiveCartId(userId);
        await db.from('cart_items').delete().eq('cart_id', cartId).eq('artwork_id', artworkId);
      } catch (error) {
        console.error('Failed to remove cart item', error);
      }
    }

    setItems((prev) => prev.filter((item) => item.artwork.id !== artworkId));
  };

  const clearCart = async () => {
    if (userId) {
      try {
        const cartId = await getOrCreateActiveCartId(userId);
        await db.from('cart_items').delete().eq('cart_id', cartId);
      } catch (error) {
        console.error('Failed to clear cart', error);
      }
    }
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce(
      (total, item) => total + item.artwork.price * item.quantity,
      0
    );
  };

  const getShippingCostForCountry = useCallback(
    (country: string | null | undefined) => {
      const subtotal = items.reduce((total, item) => total + item.artwork.price * item.quantity, 0);
      return calculateShippingByCountry(
        subtotal,
        country,
        domesticShippingPercentage,
        internationalShippingPercentage
      );
    },
    [items, domesticShippingPercentage, internationalShippingPercentage]
  );

  /** Cart / drawer: no shipping until checkout (address-based). Guest or logged-in — same behavior. */
  const getShippingCost = useCallback(() => {
    return 0;
  }, []);

  const getTotalWithShippingForCountry = useCallback(
    (country: string | null | undefined) => {
      const subtotal = items.reduce((total, item) => total + item.artwork.price * item.quantity, 0);
      return subtotal + calculateShippingByCountry(
        subtotal,
        country,
        domesticShippingPercentage,
        internationalShippingPercentage
      );
    },
    [items, domesticShippingPercentage, internationalShippingPercentage]
  );

  /** Cart total excludes shipping; shipping is added at checkout with address. */
  const getTotalWithShipping = useCallback(() => {
    return items.reduce((total, item) => total + item.artwork.price * item.quantity, 0);
  }, [items]);

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getShippingCostForCountry,
        getShippingCost,
        getTotalWithShippingForCountry,
        getTotalWithShipping,
        getItemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
