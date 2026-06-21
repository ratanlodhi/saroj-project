import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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

/** Lifestyle / in-room photo shown as the fourth carousel view (see `public/media/sofa.jpg`). */
const ROOM_CAROUSEL_IMAGE = '/media/sofa.jpg';
/** Wall mockup shown after the frame view (using sofa mockup). */
const WALL_CAROUSEL_IMAGE = '/media/sofa.avif';
/** Compositing bounds on wall.jpg (includes frame/mat; 1000x1000 mockup). */
const WALL_ART_FRAME_BOUNDS = {
  top: 5.5,
  width: 49,
  height: 37,
} as const;
/** Compositing bounds on sofa.jpg where painting should appear in the room slide. */
const ROOM_ART_FRAME_BOUNDS = {
  top: 8.5,
  left: 41,
  width: 33,
  height: 35,
} as const;

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

const getArtworkAspectRatio = (artwork: Artwork): number => {
  const dimensions = parseHeightWidthInches(artwork.size);
  if (dimensions) {
    const height = Number(dimensions.height);
    const width = Number(dimensions.width);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      const larger = Math.max(width, height);
      const smaller = Math.min(width, height);
      if (artwork.orientation === 'vertical') return smaller / larger;
      if (artwork.orientation === 'horizontal') return larger / smaller;
      return width / height;
    }
  }

  if (artwork.orientation === 'vertical') return 0.75;
  if (artwork.orientation === 'horizontal') return 1.5;
  return 1;
};

const clampAspectRatio = (aspect: number) => Math.min(Math.max(aspect, 0.35), 3);

const getWallFrameStyle = (artwork: Artwork, aspectOverride?: number | null): CSSProperties => {
  const boundsAspect = WALL_ART_FRAME_BOUNDS.width / WALL_ART_FRAME_BOUNDS.height;
  const artworkAspect = clampAspectRatio(aspectOverride ?? getArtworkAspectRatio(artwork));

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

const WALL_FRAME_SCALE = 0.48; // scale down the composited frame so it appears smaller on the mockup
const WALL_FRAME_TOP_NUDGE = -6; // percent points to nudge the frame upward (negative moves up)
const ROOM_FRAME_SCALE = 0.82; // fit within the existing frame slot in the room mockup photo

const getRoomFrameStyle = (artwork: Artwork, aspectOverride?: number | null): CSSProperties => {
  const boundsAspect = ROOM_ART_FRAME_BOUNDS.width / ROOM_ART_FRAME_BOUNDS.height;
  const artworkAspect = clampAspectRatio(aspectOverride ?? getArtworkAspectRatio(artwork));

  let width = ROOM_ART_FRAME_BOUNDS.width;
  let height = ROOM_ART_FRAME_BOUNDS.height;

  if (artworkAspect > boundsAspect) {
    height = width / artworkAspect;
  } else {
    width = height * artworkAspect;
  }

  const scaledWidth = width * ROOM_FRAME_SCALE;
  const scaledHeight = height * ROOM_FRAME_SCALE;
  const left = ROOM_ART_FRAME_BOUNDS.left + (ROOM_ART_FRAME_BOUNDS.width - scaledWidth) / 2;
  const top = ROOM_ART_FRAME_BOUNDS.top + (ROOM_ART_FRAME_BOUNDS.height - scaledHeight) / 2;

  return {
    left: `${left}%`,
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

type FrameVariant = 'default' | 'wall' | 'thumbnail' | 'tight' | 'mockup';

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
    mockup: {
      shell: 'h-full w-full rounded-[1px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] box-border overflow-hidden',
      outer: 'box-border h-full w-full rounded-[1px] border-[5px] border-primary bg-primary',
      inner: 'box-border h-full w-full border-[5px] border-muted bg-muted overflow-hidden',
      image: 'block h-full w-full object-cover object-center min-h-0',
    },
    wall: {
      shell: 'h-full w-full rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-1 ring-black/10',
      outer: 'h-full rounded-[2px] bg-primary p-[2%]',
      inner: 'h-full rounded-[1px] bg-muted p-[2%] shadow-inner flex items-center justify-center',
      image: 'block h-full w-full object-contain object-center min-h-0',
    },
    thumbnail: {
      shell: 'h-full w-full max-h-full rounded-sm shadow-sm ring-1 ring-black/10',
      outer: 'h-full rounded-[2px] bg-primary p-[2px] flex items-center justify-center',
      inner: 'h-full rounded-[1px] bg-muted p-[2px] shadow-inner flex items-center justify-center overflow-hidden',
      image: 'max-h-full max-w-full h-full w-full object-contain',
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

const THUMB_PREVIEW_CLASS =
  'relative h-14 sm:h-16 w-full overflow-hidden flex items-center justify-center bg-muted/20';

const ThumbPreviewShell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn(THUMB_PREVIEW_CLASS, className)}>{children}</div>;

type DisplaySlideVariant = 'normal' | 'dimensions' | 'frame' | 'wall' | 'room';

type DisplaySlide = {
  id: string;
  variant: DisplaySlideVariant;
  src: string;
  label: string;
};

const DimensionOverlay = ({
  dimensions,
  compact = false,
}: {
  dimensions: { height: string; width: string };
  compact?: boolean;
}) => (
  <>
    <div
      className={cn(
        'pointer-events-none absolute border-b border-primary/45',
        compact ? 'left-1 right-4 top-1.5' : 'left-2 right-8 sm:right-10 top-3'
      )}
    />
    <div
      className={cn(
        'pointer-events-none absolute w-0 h-0 border-t-transparent border-b-transparent border-r-primary/45',
        compact
          ? 'left-0 top-[3px] border-t-[3px] border-b-[3px] border-r-[4px]'
          : 'left-0 top-[7px] border-t-[5px] border-b-[5px] border-r-[7px]'
      )}
    />
    <div
      className={cn(
        'pointer-events-none absolute w-0 h-0 border-t-transparent border-b-transparent border-l-primary/45',
        compact
          ? 'right-4 top-[3px] border-t-[3px] border-b-[3px] border-l-[4px]'
          : 'right-8 sm:right-10 top-[7px] border-t-[5px] border-b-[5px] border-l-[7px]'
      )}
    />
    <p
      className={cn(
        'pointer-events-none absolute left-1/2 -translate-x-1/2 font-semibold uppercase tracking-[0.18em] text-primary/80 whitespace-nowrap',
        compact ? 'top-0 text-[6px]' : 'top-0 text-[10px] sm:text-xs'
      )}
    >
      {dimensions.width} inches
    </p>

    <div
      className={cn(
        'pointer-events-none absolute border-r border-primary/45',
        compact ? 'top-3 bottom-0 right-1.5' : 'top-7 bottom-0 right-3 sm:right-4'
      )}
    />
    <div
      className={cn(
        'pointer-events-none absolute w-0 h-0 border-l-transparent border-r-transparent border-b-primary/45',
        compact
          ? 'top-[10px] right-[4px] border-l-[3px] border-r-[3px] border-b-[4px]'
          : 'top-[20px] right-[10px] sm:right-[12px] border-l-[5px] border-r-[5px] border-b-[7px]'
      )}
    />
    <div
      className={cn(
        'pointer-events-none absolute w-0 h-0 border-l-transparent border-r-transparent border-t-primary/45',
        compact
          ? 'bottom-0 right-[4px] border-l-[3px] border-r-[3px] border-t-[4px]'
          : 'bottom-0 right-[10px] sm:right-[12px] border-l-[5px] border-r-[5px] border-t-[7px]'
      )}
    />
    <p
      className={cn(
        'pointer-events-none absolute -translate-y-1/2 rotate-90 font-semibold uppercase tracking-[0.18em] text-primary/80 whitespace-nowrap',
        compact ? 'top-1/2 -right-2 text-[6px]' : 'top-1/2 -right-4 sm:-right-5 text-[10px] sm:text-xs'
      )}
    >
      {dimensions.height} inches
    </p>
  </>
);

const ArtworkSlidePreview = ({
  slide,
  primaryImage,
  title,
  dimensions,
  wallFrameStyle,
  roomFrameStyle,
  size = 'main',
}: {
  slide: Pick<DisplaySlide, 'variant' | 'src'>;
  primaryImage: string;
  title: string;
  dimensions: { height: string; width: string } | null;
  wallFrameStyle: CSSProperties;
  roomFrameStyle: CSSProperties;
  size?: 'main' | 'thumb';
}) => {
  const isThumb = size === 'thumb';
  const mainImageClass =
    'block w-full max-h-[min(36dvh,320px)] sm:max-h-[min(42dvh,420px)] md:max-h-[min(60dvh,560px)] object-contain min-h-0';

  if (slide.variant === 'frame') {
    if (isThumb) {
      return (
        <ThumbPreviewShell>
          <FramedPainting
            src={primaryImage}
            alt={title}
            variant="thumbnail"
            className="h-full w-full"
          />
        </ThumbPreviewShell>
      );
    }

    return (
      <FramedPainting
        src={primaryImage}
        alt={title}
        variant="default"
      />
    );
  }

  if (slide.variant === 'wall') {
    if (isThumb) {
      return (
        <ThumbPreviewShell>
          <div className="relative h-full w-full">
            <img
              src={WALL_CAROUSEL_IMAGE}
              alt={`${title} — wall display`}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-1/2 -translate-x-1/2" style={wallFrameStyle}>
              {/* <FramedPainting
                src={primaryImage}
                alt={title}
                variant="mockup"
                className="mx-0"
              /> */}
            </div>
          </div>
        </ThumbPreviewShell>
      );
    }

    return (
      <div className="relative mx-auto w-full max-w-full">
        <img
          src={WALL_CAROUSEL_IMAGE}
          alt={`${title} — wall display`}
          className={cn('block mx-auto', mainImageClass)}
        />
        <div className="absolute" style={roomFrameStyle}>
          <FramedPainting
            src={primaryImage}
            alt={title}
            variant="mockup"
            className="mx-0"
          />
        </div>
      </div>
    );
  }

  if (slide.variant === 'room') {
    if (isThumb) {
      return (
        <ThumbPreviewShell>
          <div className="relative h-full w-full">
            <img
              src={ROOM_CAROUSEL_IMAGE}
              alt={`${title} — room setting`}
              className="h-full w-full object-cover"
            />
            <div className="absolute" style={roomFrameStyle}>
              {/* <FramedPainting
                src={primaryImage}
                alt={title}
                variant="mockup"
                className="mx-0"
              /> */}
            </div>
          </div>
        </ThumbPreviewShell>
      );
    }

    return (
      <div className="relative mx-auto w-full max-w-full">
        <img
          src={ROOM_CAROUSEL_IMAGE}
          alt={`${title} — room setting`}
          className={cn('block mx-auto', mainImageClass)}
        />
        <div className="absolute" style={roomFrameStyle}>
          <FramedPainting
            src={primaryImage}
            alt={title}
            variant="mockup"
            className="mx-0"
          />
        </div>
      </div>
    );
  }

  if (isThumb) {
    return (
      <ThumbPreviewShell>
        <img src={slide.src} alt={title} className="h-full w-full object-contain" />
        {dimensions && slide.variant === 'dimensions' && (
          <DimensionOverlay dimensions={dimensions} compact />
        )}
      </ThumbPreviewShell>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full',
        slide.variant === 'dimensions'
          ? 'inline-block max-w-full pr-8 pt-7 pb-0 sm:pr-10 sm:pt-8 sm:pb-0'
          : 'mx-auto flex justify-center'
      )}
    >
      <img src={slide.src} alt={title} className={mainImageClass} />
      {dimensions && slide.variant === 'dimensions' && (
        <DimensionOverlay dimensions={dimensions} />
      )}
    </div>
  );
};

function useImageAspectRatio(src: string): number | null {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!src) {
      setAspectRatio(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.onerror = () => setAspectRatio(null);
    img.src = src;
  }, [src]);

  return aspectRatio;
}

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
  const selectedPrimaryImage = selectedArtwork
    ? parseArtworkImages(selectedArtwork)[0] || selectedArtwork.image_url || selectedArtwork.image || ''
    : '';
  const selectedImageAspectRatio = useImageAspectRatio(selectedPrimaryImage);

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
      setSelectedViewIndex(0);
      setSelectedArtwork(matchingArtwork);
      openedArtworkIdRef.current = artworkId;
    }
  }, [artworkId, artworks, loading]);

  useEffect(() => {
    setSelectedViewIndex(0);
  }, [selectedArtwork?.id]);

  const openArtworkDetails = (artwork: Artwork) => {
    setSelectedViewIndex(0);
    setSelectedArtwork(artwork);
  };

  const closeArtworkDetails = () => {
    setSelectedArtwork(null);
    setSelectedViewIndex(0);
  };

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
                        onClick={() => openArtworkDetails(artwork)}
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
                            className="gap-2 font-serif rounded-full px-5"
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </Button>
                        )}
                        <PoweredByRasayanTagline />
                        <button
                          onClick={() => openArtworkDetails(artwork)}
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
          const wallFrameStyle = getWallFrameStyle(selectedArtwork, selectedImageAspectRatio);
          const roomFrameStyle = getRoomFrameStyle(selectedArtwork, selectedImageAspectRatio);
          const displaySlides: DisplaySlide[] = [
            { id: 'normal', variant: 'normal', src: primaryImage, label: 'Normal' },
            { id: 'dimensions', variant: 'dimensions', src: primaryImage, label: 'Height/Width' },
            { id: 'frame', variant: 'frame', src: primaryImage, label: 'Frame' },
            { id: 'wall', variant: 'wall', src: WALL_CAROUSEL_IMAGE, label: 'Wall' },
            { id: 'room', variant: 'room', src: ROOM_CAROUSEL_IMAGE, label: 'Room' },
          ];
          const activeSlide = displaySlides[selectedViewIndex] ?? displaySlides[0];

          return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto overscroll-contain"
          onClick={closeArtworkDetails}
        >
          <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
          <div
            className="relative my-auto w-full max-w-5xl h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-[min(100dvh,900px)] min-h-0 flex flex-col md:flex-row bg-card rounded-none sm:rounded-sm overflow-hidden shadow-elegant animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeArtworkDetails}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 flex items-center justify-center text-primary hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="min-h-0 shrink-0 md:shrink md:flex-[1.15] bg-muted/20 px-2 pt-12 pb-1 sm:p-5 md:p-6 max-h-[min(52dvh,520px)] md:max-h-none overflow-hidden flex flex-col">
              <div className="flex-1 min-h-[190px] sm:min-h-[220px] flex items-center justify-center w-full">
                <ArtworkSlidePreview
                  slide={activeSlide}
                  primaryImage={primaryImage}
                  title={selectedArtwork.title}
                  dimensions={dimensions}
                  wallFrameStyle={wallFrameStyle}
                  roomFrameStyle={roomFrameStyle}
                  size="main"
                />
              </div>

              <div className="mt-1 sm:mt-2 md:mt-3">
                <Carousel opts={{ align: 'start' }} className="w-full px-1 sm:px-4 md:px-6">
                  <CarouselContent className="-ml-1 items-stretch">
                    {displaySlides.map((slide, slideIndex) => (
                      <CarouselItem
                        key={`${selectedArtwork.id}-thumb-${slide.id}`}
                        className="pl-1 basis-1/5 flex"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedViewIndex(slideIndex)}
                          className={cn(
                            'w-full h-14 sm:h-16 overflow-hidden rounded-sm border transition-all p-0',
                            selectedViewIndex === slideIndex
                              ? 'border-primary ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                          aria-label={`View ${slide.label}`}
                        >
                          <ArtworkSlidePreview
                            slide={slide}
                            primaryImage={primaryImage}
                            title={selectedArtwork.title}
                            dimensions={dimensions}
                            wallFrameStyle={wallFrameStyle}
                            roomFrameStyle={roomFrameStyle}
                            size="thumb"
                          />
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
