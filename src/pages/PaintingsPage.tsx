import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useArtworks } from '@/hooks/useArtworks';
import { useCategories } from '@/hooks/useCategories';
import { shouldShowPoweredByRasayan } from '@/lib/artworkAvailability';
import { formatArtworkSizeDisplay } from '@/lib/formatArtworkSize';
import PoweredByRasayanTagline from '@/components/PoweredByRasayanTagline';
import PriceAndDetailsSection from '@/components/PriceAndDetailsSection';
import PaintingFrame from '@/components/PaintingFrame';
import type { Artwork } from '@/hooks/useArtworks';
import type { Orientation } from '@/components/PaintingFrame';

export default function PaintingsPage() {

  const [searchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high'>('price-low');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const openedArtworkIdRef = useRef<string | null>(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { artworks, loading } = useArtworks();
  const { categories } = useCategories();

  const poweredByFor = (artwork: Artwork) => shouldShowPoweredByRasayan(artwork, categories);
  const searchTerm = searchParams.get('search')?.trim().toLowerCase() ?? '';
  const artworkId = searchParams.get('artwork')?.trim() ?? '';

  useEffect(() => {
    if (!artworkId || loading || !artworks.length || openedArtworkIdRef.current === artworkId) {
      return;
    }

    const matchingArtwork = artworks.find((artwork) => artwork.id === artworkId);
    if (matchingArtwork) {
      setSelectedArtwork(matchingArtwork);
      openedArtworkIdRef.current = artworkId;
    }
  }, [artworkId, artworks, loading]);

  const filteredArtworks = artworks.filter((a) => {
    const matchesCategory = activeCategoryId === 'all' || a.category_id === activeCategoryId;

    if (!searchTerm) {
      return matchesCategory;
    }

    const searchableText = [a.title, a.description, a.artist, a.medium, a.size]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return matchesCategory && searchableText.includes(searchTerm);
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    return b.price - a.price;
  });

  console.log('[PaintingsPage] render', {
    loading,
    totalArtworks: artworks.length,
    filteredArtworks: filteredArtworks.length,
    activeCategoryId,
    sortBy,
  });

  const handleAddToCart = (artwork: Artwork) => {
    addToCart(artwork);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Complete Collection</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Paintings
          </h1>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Detailed view of our complete artwork collection with specifications and descriptions.
          </p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground font-sans mt-3">
              Showing results for "{searchParams.get('search')}"
            </p>
          )}
          <div className="section-divider mt-8" />
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <select
                value={activeCategoryId}
                onChange={(e) => setActiveCategoryId(e.target.value)}
                className="bg-card text-foreground px-4 py-2 rounded-sm text-sm font-sans border border-border focus:ring-2 focus:ring-accent focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price-low' | 'price-high')}
                  className="bg-card text-foreground px-4 py-2 rounded-sm text-sm font-sans border border-border focus:ring-2 focus:ring-accent focus:outline-none"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paintings Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sortedArtworks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No paintings found for the selected filters{searchTerm ? ' and search term' : ''}.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {sortedArtworks.map((artwork, index) => (
                <article
                  key={artwork.id}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,11rem)_1fr] md:grid-cols-[minmax(0,12rem)_1fr] gap-5 sm:gap-6 items-start">
                    <div className="hover-lift flex justify-center sm:justify-start mx-auto sm:mx-0 w-full sm:max-w-[11rem] md:max-w-[12rem]">
                      <button
                        type="button"
                        onClick={() => setSelectedArtwork(artwork)}
                        className="w-full cursor-pointer block text-left"
                      >
                        {/* Listing thumbnail: fixed frame keeps row height sensible; full detail in lightbox */}
                        <div className="overflow-hidden bg-secondary/20 rounded-sm flex h-[200px] sm:h-[210px] md:h-[200px] lg:h-[220px] w-full items-center justify-center p-2">
                          <img
                            src={artwork.image || ''}
                            alt={artwork.title}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-serif text-xl font-semibold text-primary">
                          {formatPrice(artwork.price)}
                        </p>
                        {poweredByFor(artwork) && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-highlight text-highlight-foreground rounded max-w-[14rem] leading-snug">
                            Not for sale
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-lg md:text-xl font-medium text-primary mt-1">
                        {artwork.title} Painting
                      </h2>
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p>{artwork.medium}</p>
                        <p>{formatArtworkSizeDisplay(artwork.size)}</p>
                      </div>
                      <p className="mt-4 text-muted-foreground font-sans text-sm leading-relaxed line-clamp-2">
                        {artwork.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {!poweredByFor(artwork) && (
                          <Button
                            onClick={() => handleAddToCart(artwork)}
                            size="sm"
                            className="gap-2"
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </Button>
                        )}
                        <PoweredByRasayanTagline />
                        <button
                          onClick={() => setSelectedArtwork(artwork)}
                          className="text-sm text-accent hover:text-primary transition-colors font-sans"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-y-auto overscroll-contain"
          onClick={() => setSelectedArtwork(null)}
        >
          <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
          <div
            className="relative my-auto w-full max-w-5xl max-h-[min(100dvh,900px)] min-h-0 flex flex-col md:flex-row bg-card rounded-sm overflow-hidden shadow-elegant animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 flex items-center justify-center text-primary hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="min-h-0 shrink-0 md:shrink md:flex-[1.15] flex items-center justify-center bg-muted/20 px-3 pt-12 pb-4 sm:p-5 md:p-6 max-h-[min(52dvh,520px)] md:max-h-none overflow-hidden">
              <PaintingFrame
                imageUrl={selectedArtwork.image_url || selectedArtwork.image || ''}
                alt={selectedArtwork.title}
                orientation={(selectedArtwork.orientation as Orientation) || undefined}
                allowFrameSwitch={true}
                compact
                className="w-full max-h-full min-h-0"
              />
            </div>

            <div className="min-h-0 flex-1 md:w-[38%] lg:w-1/3 p-4 sm:p-6 md:p-8 flex flex-col justify-start overflow-y-auto border-t md:border-t-0 md:border-l border-border md:max-h-[min(90vh,900px)]">
              {/* Price */}
              <p className="font-serif text-2xl md:text-3xl font-semibold text-primary">
                {formatPrice(selectedArtwork.price)}
              </p>
              
              {/* Title */}
              <h2 className="font-serif text-xl md:text-2xl font-medium text-primary mt-3">
                {selectedArtwork.title} Painting
              </h2>

              {/* Medium & Size */}
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>{selectedArtwork.medium}</p>
                <p>{formatArtworkSizeDisplay(selectedArtwork.size)}</p>
              </div>

              {/* Description */}
              <p className="mt-6 text-muted-foreground font-sans leading-relaxed text-sm">
                {selectedArtwork.description}
              </p>

              {!poweredByFor(selectedArtwork) && (
                <Button
                  onClick={() => handleAddToCart(selectedArtwork)}
                  className="mt-6 w-full gap-2"
                  size="lg"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </Button>
              )}

              {/* Price & Details Section */}
              <div className="mt-8">
                <PriceAndDetailsSection artwork={selectedArtwork} readOnly={true} />
              </div>
              <div className="mt-4 w-full border border-border rounded-sm px-4 py-3 text-center">
                <PoweredByRasayanTagline className="text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
