import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X, Filter, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useArtworks } from '@/hooks/useArtworks';
import { useCategories } from '@/hooks/useCategories';
import { shouldShowPoweredByRasayan } from '@/lib/artworkAvailability';
import { formatArtworkSizeDisplay } from '@/lib/formatArtworkSize';
import PoweredByRasayanTagline from '@/components/PoweredByRasayanTagline';
import PriceAndDetailsSection from '@/components/PriceAndDetailsSection';
import type { Artwork } from '@/hooks/useArtworks';

/** Lifestyle / in-room photo shown as the fourth carousel view (see `public/media/room.jpeg`). */
const ROOM_CAROUSEL_IMAGE = '/media/room.jpeg';
/** Wall mockup shown after the frame view (using sofa mockup). */
const WALL_CAROUSEL_IMAGE = '/media/sofa.avif';
/** Compositing bounds on wall.jpg (includes frame/mat; 1000x1000 mockup). */
const WALL_ART_FRAME_BOUNDS = {
  top: 5.5,
  width: 49,
  height: 37,
} as const;

const getArtworkAspectRatio = (artwork: Artwork): number => {
  const dimensions = parseHeightWidthInches(artwork.size);
  if (dimensions) {
    const width = Number(dimensions.width);
    const height = Number(dimensions.height);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return width / height;
    }
  }

  if (artwork.orientation === 'vertical') return 0.75;
  if (artwork.orientation === 'horizontal') return 1.5;
  return 1;
};

const WALL_FRAME_SCALE = 0.48; // scale down the composited frame so it appears smaller on the mockup
const WALL_FRAME_TOP_NUDGE = -6; // percent points to nudge the frame upward (negative moves up)

const getWallFrameStyle = (artwork: Artwork): CSSProperties => {
  const boundsAspect = WALL_ART_FRAME_BOUNDS.width / WALL_ART_FRAME_BOUNDS.height;
  const artworkAspect = Math.min(Math.max(getArtworkAspectRatio(artwork), 0.35), 3);

  // Compute the raw width/height (percent of the mockup area)
  let width = WALL_ART_FRAME_BOUNDS.width;
  let height = WALL_ART_FRAME_BOUNDS.height;

  if (artworkAspect > boundsAspect) {
    height = width / artworkAspect;
  } else {
    width = height * artworkAspect;
  }

  // Apply scale to make the frame smaller and center it vertically within bounds
  const scaledWidth = width * WALL_FRAME_SCALE;
  const scaledHeight = height * WALL_FRAME_SCALE;
  let top = WALL_ART_FRAME_BOUNDS.top + (WALL_ART_FRAME_BOUNDS.height - scaledHeight) / 2 + WALL_FRAME_TOP_NUDGE;
  if (top < 0) top = 0;

  return {
    top: `${top}%`,
    width: `${scaledWidth}%`,
    height: `${scaledHeight}%`,
  };
};

const parseArtworkImages = (artwork: Artwork): string[] => {
  const rawSources = [artwork.image_url, artwork.image].filter(Boolean) as string[];

  const images = rawSources
    .flatMap((source) => {
      const normalized = source.trim();
      if (!normalized) return [];

      if (normalized.includes('\n') || normalized.includes('|')) {
        return normalized.split(/[\n|]+/).map((value) => value.trim());
      }

      const commaParts = normalized.split(',').map((value) => value.trim()).filter(Boolean);
      const looksLikeUrl = (value: string) => /^https?:\/\//i.test(value) || value.startsWith('/');
      if (commaParts.length > 1 && commaParts.every(looksLikeUrl)) {
        return commaParts;
      }

      return [normalized];
    })
    .map((value) => value.trim())
    .filter(Boolean);

  const uniqueImages = Array.from(new Set(images));
  return uniqueImages;
};

type FrameVariant = 'default' | 'wall' | 'thumbnail' | 'tight';

const FramedPainting = ({
  src,
  alt,
  variant = 'default',
  imageClassName,
  className,
}: {
  src: string;
  alt: string;
  variant?: FrameVariant;
  imageClassName?: string;
  className?: string;
}) => {
  const frameStyles: Record<
    FrameVariant,
    { shell: string; outer: string; inner: string; image: string }
  > = {
    default: {
      shell: 'rounded-md shadow-[0_14px_42px_rgba(0,0,0,0.22)] ring-1 ring-black/10',
      outer: 'rounded-[3px] bg-primary p-3 sm:p-4 md:p-6',
      inner: 'rounded-[1px] bg-muted p-2 sm:p-3 md:p-4 shadow-inner',
      image:
        'block w-full max-h-[min(32dvh,280px)] sm:max-h-[min(38dvh,380px)] md:max-h-[min(54dvh,500px)] object-contain min-h-0',
    },
    tight: {
      shell: 'rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/8',
      outer: 'rounded-[3px] bg-primary p-1 sm:p-1.5',
      inner: 'rounded-[1px] bg-muted p-0.5 sm:p-1 shadow-inner',
      image: 'block w-full h-full object-contain min-h-0',
    },
    wall: {
      shell: 'h-full w-full rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-1 ring-black/10',
      outer: 'h-full rounded-[2px] bg-primary p-[2%]',
      inner: 'h-full rounded-[1px] bg-muted p-[2%] shadow-inner flex items-center justify-center',
      image: 'block h-full w-full object-contain object-center min-h-0',
    },
    thumbnail: {
      shell: 'rounded-sm shadow-sm ring-1 ring-black/10',
      outer: 'rounded-[2px] bg-primary p-1 sm:p-1.5',
      inner: 'rounded-[1px] bg-muted p-0.5 sm:p-1 shadow-inner',
      image: 'w-full h-9 sm:h-12 object-contain',
    },
  };

  const styles = frameStyles[variant];

  return (
    <div className={cn('relative mx-auto max-w-full', styles.shell, className)}>
      <div className={styles.outer}>
        <div className={styles.inner}>
          <img src={src} alt={alt} className={cn(styles.image, imageClassName)} />
        </div>
      </div>
    </div>
  );
};

const parseHeightWidthInches = (size: string): { height: string; width: string } | null => {
  const normalized = formatArtworkSizeDisplay(size);
  const pair = normalized.match(/^(\d+(?:\.\d+)?)\s+inches\s*\*\s*(\d+(?:\.\d+)?)\s+inches$/i);

  if (!pair) {
    return null;
  }

  return {
    height: pair[1],
    width: pair[2],
  };
};

export default function PaintingsPage() {

  const [searchParams] = useSearchParams();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high'>('price-low');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedViewIndex, setSelectedViewIndex] = useState(0);
  const openedArtworkIdRef = useRef<string | null>(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { artworks, loading } = useArtworks();
  const { categories } = useCategories();

  const poweredByFor = (artwork: Artwork) => shouldShowPoweredByRasayan(artwork, categories);
  const paintingTypeFor = (artwork: Artwork) =>
    categories.find((category) => category.id === artwork.category_id)?.name || artwork.medium;
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

  useEffect(() => {
    setSelectedViewIndex(0);
  }, [selectedArtwork?.id]);

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
      {/* <section className="py-12 md:py-20">
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
      </section> */}

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
                        {/* On mobile, let image drive height to avoid empty boxed space around portrait works. */}
                        <div className="overflow-hidden rounded-sm w-full sm:bg-secondary/20 sm:flex sm:h-[210px] md:h-[200px] lg:h-[220px] sm:items-center sm:justify-center sm:p-2">
                          <img
                            src={artwork.image || ''}
                            alt={artwork.title}
                            className="w-full h-auto object-contain sm:max-h-full sm:max-w-full transition-transform duration-500 group-hover:scale-105"
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
                          <span className="px-2 py-0.5 text-xs font-medium font-serif bg-highlight text-highlight-foreground rounded max-w-[14rem] leading-snug">
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
                            className="gap-2 font-serif"
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
        (() => {
          const artworkImages = parseArtworkImages(selectedArtwork);
          const primaryImage = artworkImages[0] || selectedArtwork.image_url || selectedArtwork.image || '';
          const dimensions = parseHeightWidthInches(selectedArtwork.size);
          const wallFrameStyle = getWallFrameStyle(selectedArtwork);
          const displaySlides = [
            { id: 'normal', variant: 'normal' as const, src: primaryImage, label: 'Normal' },
            { id: 'dimensions', variant: 'dimensions' as const, src: primaryImage, label: 'Height/Width' },
            { id: 'frame', variant: 'frame' as const, src: primaryImage, label: 'Frame' },
            { id: 'wall', variant: 'wall' as const, src: WALL_CAROUSEL_IMAGE, label: 'Wall' },
            { id: 'room', variant: 'room' as const, src: ROOM_CAROUSEL_IMAGE, label: 'Room' },
          ];
          const activeSlide = displaySlides[selectedViewIndex] ?? displaySlides[0];

          return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto overscroll-contain"
          onClick={() => setSelectedArtwork(null)}
        >
          <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
          <div
            className="relative my-auto w-full max-w-5xl h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-[min(100dvh,900px)] min-h-0 flex flex-col md:flex-row bg-card rounded-none sm:rounded-sm overflow-hidden shadow-elegant animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 flex items-center justify-center text-primary hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="min-h-0 shrink-0 md:shrink md:flex-[1.15] bg-muted/20 px-2 pt-12 pb-1 sm:p-5 md:p-6 max-h-[min(52dvh,520px)] md:max-h-none overflow-hidden flex flex-col">
              <div className="flex-1 min-h-[190px] sm:min-h-[220px] flex items-center justify-center w-full">
                <div
                  className={cn(
                    'relative w-full',
                    activeSlide.variant === 'dimensions'
                      ? 'inline-block max-w-full pr-14 pt-10 pb-12 sm:pr-16 sm:pt-10 sm:pb-12'
                      : 'mx-auto flex justify-center'
                  )}
                >
                  {activeSlide.variant === 'frame' ? (
                    <FramedPainting
                      src={primaryImage}
                      alt={selectedArtwork.title}
                      variant="default"
                    />
                  ) : activeSlide.variant === 'wall' ? (
                    <div className="relative mx-auto w-full max-w-full">
                      <img
                        src={WALL_CAROUSEL_IMAGE}
                        alt={`${selectedArtwork.title} — wall display`}
                        className="block mx-auto w-full max-h-[min(36dvh,320px)] sm:max-h-[min(42dvh,420px)] md:max-h-[min(60dvh,560px)] object-contain min-h-0"
                      />
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={wallFrameStyle}
                      >
                            <FramedPainting
                              src={primaryImage}
                              alt={selectedArtwork.title}
                              variant="tight"
                              className="mx-0"
                              imageClassName="h-full w-full object-contain"
                            />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={activeSlide.src}
                      alt={
                        activeSlide.variant === 'room'
                          ? `${selectedArtwork.title} — room setting`
                          : selectedArtwork.title
                      }
                      className="block w-full max-h-[min(36dvh,320px)] sm:max-h-[min(42dvh,420px)] md:max-h-[min(60dvh,560px)] object-contain min-h-0"
                    />
                  )}
                  {dimensions && activeSlide.variant === 'dimensions' && (
                    <>
                      <div className="pointer-events-none absolute left-2 right-14 sm:right-16 top-5 border-b border-primary/45" />
                      <div className="pointer-events-none absolute left-0 top-[15px] w-0 h-0 border-t-[5px] border-b-[5px] border-r-[7px] border-t-transparent border-b-transparent border-r-primary/45" />
                      <div className="pointer-events-none absolute right-14 sm:right-16 top-[15px] w-0 h-0 border-t-[5px] border-b-[5px] border-l-[7px] border-t-transparent border-b-transparent border-l-primary/45" />
                      <p className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary/80 whitespace-nowrap">
                        {dimensions.width} inches
                      </p>

                      <div className="pointer-events-none absolute top-10 bottom-12 right-8 border-r border-primary/45" />
                      <div className="pointer-events-none absolute top-[33px] right-[27px] w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-primary/45" />
                      <div className="pointer-events-none absolute bottom-12 right-[27px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-primary/45" />
                      <p className="pointer-events-none absolute top-1/2 -right-6 sm:-right-7 -translate-y-1/2 rotate-90 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-primary/80 whitespace-nowrap">
                        {dimensions.height} inches
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-1 sm:mt-2 md:mt-3">
                <Carousel opts={{ align: 'start' }} className="w-full px-1 sm:px-4 md:px-6">
                  <CarouselContent className="-ml-1">
                    {displaySlides.map((slide, slideIndex) => (
                      <CarouselItem
                        key={`${selectedArtwork.id}-thumb-${slide.id}`}
                        className="pl-1 basis-1/4 md:basis-1/5"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedViewIndex(slideIndex)}
                          className={cn(
                            'w-full overflow-hidden rounded-sm border transition-all text-left',
                            selectedViewIndex === slideIndex
                              ? 'border-primary ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                          aria-label={`View ${slide.label}`}
                        >
                          {slide.variant === 'frame' ? (
                            <FramedPainting
                              src={primaryImage}
                              alt={`${selectedArtwork.title} ${slide.label}`}
                              variant="thumbnail"
                              className="w-full"
                            />
                          ) : slide.variant === 'wall' ? (
                            <div className="w-full h-10 sm:h-12 overflow-hidden rounded-sm relative">
                              <img
                                src={WALL_CAROUSEL_IMAGE}
                                alt={`${selectedArtwork.title} wall thumbnail`}
                                className="w-full h-full object-contain"
                              />
                              <div
                                className="absolute left-1/2 -translate-x-1/2"
                                style={wallFrameStyle}
                              >
                                <FramedPainting
                                  src={primaryImage}
                                  alt={`${selectedArtwork.title} ${slide.label}`}
                                  variant="tight"
                                  className="mx-0"
                                />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={slide.src}
                              alt={
                                  slide.variant === 'room'
                                  ? `${selectedArtwork.title} room setting thumbnail`
                                  : `${selectedArtwork.title} ${slide.label}`
                              }
                              className="w-full h-14 sm:h-16 object-cover"
                            />
                          )}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>

            <div className="min-h-0 flex-1 md:w-[38%] lg:w-1/3 p-3 sm:p-6 md:p-8 flex flex-col justify-start overflow-y-auto border-t md:border-t-0 md:border-l border-border max-h-[48dvh] md:max-h-[min(90vh,900px)]">
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
                  className="mt-6 w-full gap-2 font-serif"
                  size="lg"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </Button>
              )}

              {/* Price & Details Section */}
              <div className="mt-8">
                <PriceAndDetailsSection
                  artwork={selectedArtwork}
                  paintingType={paintingTypeFor(selectedArtwork)}
                  readOnly={true}
                />
              </div>
              <div className="mt-4 w-full border border-border rounded-sm px-4 py-3 text-center">
                <PoweredByRasayanTagline className="text-sm" />
              </div>
            </div>
          </div>
        </div>
          );
        })()
      )}
    </div>
  );
}
