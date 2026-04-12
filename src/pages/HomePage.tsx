import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useArtworks } from '@/hooks/useArtworks';
import { useCurrency } from '@/contexts/CurrencyContext';
import heroImage from '@/assets/hero-cover.jpg';
import studioImage from '@/assets/studio.jpg';

// Recent Work images
import recentWork1 from '@/assets/recent-work/recent-1.jpg';
import recentWork2 from '@/assets/recent-work/recent-2.jpg';
import recentWork3 from '@/assets/recent-work/recent-3.jpg';
import recentWork4 from '@/assets/recent-work/recent-4.jpg';
import recentWork5 from '@/assets/recent-work/recent-5.jpg';
import recentWork6 from '@/assets/recent-work/recent-6.jpg';
import recentWork7 from '@/assets/recent-work/recent-7.jpg';

const recentWorkImages = [
  recentWork1, recentWork2, recentWork3, recentWork4, 
  recentWork5, recentWork6, recentWork7
];

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { formatPrice } = useCurrency();
  const { artworks } = useArtworks();
  const latestArtworks = artworks.slice(0, 10);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (latestArtworks.length === 0) {
      setCurrentIndex(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(window.getComputedStyle(container).columnGap || '0') || 0;
    const itemStep = (firstCard?.offsetWidth || container.clientWidth) + gap;
    const index = Math.round(scrollLeft / Math.max(itemStep, 1)) + 1;
    
    setCurrentIndex(Math.max(1, Math.min(index, latestArtworks.length)));
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollState);
    updateScrollState();
    return () => container.removeEventListener('scroll', updateScrollState);
  }, [latestArtworks.length]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Full-width Hero Image */}
      <section className="w-full">
        <div className="w-full overflow-hidden bg-secondary/20 flex justify-center max-h-[70vh] md:max-h-[85vh]">
          <img
            src={heroImage}
            alt="Hero artwork by Rasayan"
            className="w-full max-h-[70vh] md:max-h-[85vh] h-auto object-contain md:object-cover"
          />
        </div>
        <p className="text-center text-muted-foreground italic py-2 md:py-4 text-xs md:text-base px-4">
          A fervent storyteller trying to tell the story of silence
        </p>
      </section>

      {/* Recent Work - Horizontal Scroll Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal text-primary mb-8 md:mb-10">
            Recent Work
          </h2>
          
          <div 
            className="flex w-full max-w-full min-w-0 gap-0 md:gap-6 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {recentWorkImages.map((image, index) => (
              <div
                key={index}
                className="box-border block max-md:w-full max-md:min-w-full max-md:max-w-full shrink-0 grow-0 max-md:basis-full snap-start snap-always md:w-[calc(80%-8px)] md:min-w-[280px] md:max-w-[500px] md:basis-auto md:snap-start"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary/20 flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Recent work ${index + 1}`}
                    className="max-h-full w-full h-full object-contain md:object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="aspect-[4/5] md:aspect-auto md:min-h-[500px] lg:min-h-[600px] overflow-hidden bg-secondary/20 flex items-center justify-center">
            <img
              src="/gallery/abstract-1.jpg"
              alt="Studio sale artwork"
              className="max-h-full w-full h-full object-contain md:object-cover"
            />
          </div>

          {/* Text Side */}
          <div className="flex flex-col justify-center px-5 sm:px-8 py-12 sm:py-16 md:px-12 lg:px-20 xl:px-28 bg-secondary/30">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-primary mb-6 leading-tight">
              Latest<br />Update
            </h2>
            <p className="text-muted-foreground font-sans text-sm md:text-base leading-relaxed mb-8 max-w-md">
              A curated collection of original works from my archive. The collection is only available during December.
            </p>
            <div>
              <Button 
                variant="default" 
                asChild 
                className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-sm font-sans tracking-wide"
              >
                <Link to="/paintings">
                  Studio sale
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Paintings - Horizontal Scroll Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-background">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="font-sans text-sm md:text-base font-normal text-primary tracking-wide">
              Latest paintings
            </h2>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="font-sans text-sm text-muted-foreground tabular-nums">
                {currentIndex} / of {latestArtworks.length}
              </span>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className="p-2 border border-border rounded-none hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className="p-2 border border-border rounded-none hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Scrolling Container */}
          <div 
            ref={scrollContainerRef}
            className="flex w-full max-w-full min-w-0 gap-0 md:gap-6 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {latestArtworks.map((artwork) => (
              <Link
                key={artwork.id}
                to="/paintings"
                className="group box-border block max-md:w-full max-md:min-w-full max-md:max-w-full shrink-0 grow-0 max-md:basis-full snap-start snap-always md:w-[calc(50%-12px)] md:min-w-[280px] md:max-w-[400px] md:basis-auto md:snap-start"
              >
                <div className="aspect-[3/4] overflow-hidden bg-secondary/20 mb-4 flex items-center justify-center">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="max-h-full w-full h-full object-contain md:object-cover transition-transform duration-500 md:group-hover:scale-105"
                  />
                </div>
                <h3 className="font-sans text-sm md:text-base text-primary mb-1 group-hover:underline">
                  {artwork.title}
                </h3>
                <p className="font-sans text-sm text-muted-foreground">
                  {formatPrice(artwork.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Lifestyle Images */}
      <section className="bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[400px]">
            <img
              src={studioImage}
              alt="Artwork in living space"
              className="block h-full w-full object-cover md:min-h-[400px]"
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-[400px]">
            <img
              src="/gallery/mixed-media-1.jpg"
              alt="Studio materials"
              className="block h-full w-full object-cover md:min-h-[400px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
