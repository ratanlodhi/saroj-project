import { useState } from 'react';
import { mediumCategories } from '@/data/artworks';
import { cn } from '@/lib/utils';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useArtworks, type Artwork } from '@/hooks/useArtworks';
import PriceAndDetailsSection from '@/components/PriceAndDetailsSection';
import PaintingFrame from '@/components/PaintingFrame';
import type { Orientation } from '@/components/PaintingFrame';

export default function GalleryPage() {
  const [activeMedium, setActiveMedium] = useState<string>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { addToCart } = useCart();
  const { artworks, loading } = useArtworks();

  const filteredArtworks = (activeMedium === 'all'
    ? [...artworks].sort((a, b) => a.medium.localeCompare(b.medium))
    : artworks.filter((a) => {
        const lowerMedium = a.medium.toLowerCase();
        if (activeMedium === 'acrylic') return lowerMedium.includes('acrylic');
        if (activeMedium === 'oil') return lowerMedium.includes('oil');
        if (activeMedium === 'ink') return lowerMedium.includes('ink');
        if (activeMedium === 'gouache') return lowerMedium.includes('gouache');
        if (activeMedium === 'mixed-media') return lowerMedium.includes('mixed media');
        if (activeMedium === 'charcoal') return lowerMedium.includes('charcoal');
        if (activeMedium === 'soft-pastel') return lowerMedium.includes('pastel');
        return true;
      }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (selectedArtwork) {
      addToCart(selectedArtwork);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Collection</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-primary mt-4">
            Gallery
          </h1>
          <p className="text-muted-foreground font-sans mt-4 max-w-xl mx-auto">
            Explore our complete collection of paintings, each telling its own unique story.
          </p>
          <div className="section-divider mt-8" />
        </div>
      </section>

      {/* Medium Filters */}
      <section className="py-4 sticky top-36 lg:top-24 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {mediumCategories.map((medium) => (
              <button
                key={medium.id}
                onClick={() => setActiveMedium(medium.id)}
                className={cn(
                  'px-4 md:px-6 py-2 rounded-sm text-sm font-sans transition-all duration-300',
                  activeMedium === medium.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {medium.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {activeMedium === 'all' ? 'No artworks found' : `No ${activeMedium} artworks found`}
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredArtworks.map((artwork, index) => (
                <div
                  key={artwork.id}
                  className="break-inside-avoid animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="group gallery-item w-full relative">
                    <button
                      type="button"
                      onClick={() => setSelectedArtwork(artwork)}
                      className="w-full cursor-pointer text-left block"
                    >
                      <div className="overflow-hidden bg-secondary/20 rounded-sm">
                        <img
                          src={artwork.image || ''}
                          alt={artwork.title}
                          className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </button>
                    {/* Hover overlay for title */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                    >
                      <div className="bg-charcoal/75 backdrop-blur-sm rounded-sm px-3 py-2">
                        <span className="text-xs tracking-widest uppercase text-cream/70 font-sans">
                          {artwork.medium}
                        </span>
                        <h3 className="font-serif text-base text-cream mt-0.5 leading-tight">
                          {artwork.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
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
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>

            <div className="min-h-0 shrink-0 md:shrink md:flex-[1.15] flex items-center justify-center bg-muted/20 px-3 pt-12 pb-4 sm:p-5 md:p-6 max-h-[min(52dvh,520px)] md:max-h-none overflow-hidden">
              <PaintingFrame
                imageUrl={selectedArtwork.image || ''}
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
                <p>{selectedArtwork.size}</p>
              </div>

              {/* Description */}
              <p className="mt-6 text-muted-foreground font-sans leading-relaxed text-sm">
                {selectedArtwork.description}
              </p>

              {/* Price & Details Section */}
              <div className="mt-8">
                <PriceAndDetailsSection artwork={selectedArtwork} readOnly={true} />
              </div>

              {/* Add to Cart Button */}
              <Button 
                onClick={handleAddToCart}
                className="mt-8 w-full gap-2"
                size="lg"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
