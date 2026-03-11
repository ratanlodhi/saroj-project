import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useArtworks } from '@/hooks/useArtworks';
import { useCategories } from '@/hooks/useCategories';
import type { Artwork } from '@/hooks/useArtworks';

export default function PaintingsPage() {

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high'>('price-low');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { artworks, loading } = useArtworks();
  const { categories } = useCategories();

  const filteredArtworks = artworks.filter((a) => {
    if (activeCategoryId === 'all') return true;
    return a.category_id === activeCategoryId;
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    return b.price - a.price;
  });

  const handleAddToCart = (artwork: Artwork) => {
    addToCart(artwork);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
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
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {sortedArtworks.map((artwork, index) => (
              <article
                key={artwork.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="grid md:grid-cols-5 gap-6 items-start">
                  <button
                    onClick={() => setSelectedArtwork(artwork)}
                    className="md:col-span-2 w-full aspect-square overflow-hidden rounded-sm artistic-border hover-lift bg-accent flex items-center justify-center"
                  >
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      loading="lazy"
                      decoding="async"
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>

                  <div className="md:col-span-3">
                    <div className="flex items-center gap-3">
                      <p className="font-serif text-xl font-semibold text-primary">
                        {formatPrice(artwork.price)}
                      </p>
                      {artwork.sold && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-highlight text-highlight-foreground rounded">
                          Sold
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-lg md:text-xl font-medium text-primary mt-1">
                      {artwork.title} Painting
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {artwork.artist}, {artwork.artist_location}
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>{artwork.medium}</p>
                      <p>{artwork.size}</p>
                    </div>
                    <p className="mt-4 text-muted-foreground font-sans text-sm leading-relaxed line-clamp-2">
                      {artwork.description}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      {artwork.sold ? (
                        <Button size="sm" disabled className="gap-2 opacity-50">
                          <ShoppingCart size={16} />
                          Sold
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(artwork)}
                          size="sm"
                          className="gap-2"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </Button>
                      )}
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
        </div>
      </section>

      {/* Lightbox */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedArtwork(null)}
        >
          <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row bg-card rounded-sm overflow-hidden shadow-elegant animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center text-primary hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="md:w-2/3 bg-muted/20 flex items-center justify-center p-4">
              <img
                src={selectedArtwork.image_url}
                alt={selectedArtwork.title}
                className="w-full h-auto max-h-[70vh] md:max-h-[85vh] object-contain"
              />
            </div>

            <div className="md:w-1/3 p-6 md:p-8 flex flex-col justify-center">
              {/* Price */}
              <p className="font-serif text-2xl md:text-3xl font-semibold text-primary">
                {formatPrice(selectedArtwork.price)}
              </p>
              
              {/* Title */}
              <h2 className="font-serif text-xl md:text-2xl font-medium text-primary mt-3">
                {selectedArtwork.title} Painting
              </h2>
              
              {/* Artist Info */}
              <p className="text-muted-foreground font-sans mt-2">
                {selectedArtwork.artist}, {selectedArtwork.artistLocation}
              </p>
              
              {/* Medium & Size */}
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>{selectedArtwork.medium}</p>
                <p>{selectedArtwork.size}</p>
              </div>

              {/* Description */}
              <p className="mt-6 text-muted-foreground font-sans leading-relaxed text-sm">
                {selectedArtwork.description}
              </p>

              {/* Add to Cart Button */}
              <Button 
                onClick={() => handleAddToCart(selectedArtwork)}
                className="mt-6 w-full gap-2"
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
