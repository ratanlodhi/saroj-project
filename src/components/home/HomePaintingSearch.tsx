import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useArtworks } from '@/hooks/useArtworks';
import { filterArtworksByAdminSearch } from '@/lib/artworkSearch';
import { cn } from '@/lib/utils';

const MAX_SUGGESTIONS = 8;

export default function HomePaintingSearch() {
  const { artworks, loading } = useArtworks();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    return filterArtworksByAdminSearch(artworks, query).slice(0, MAX_SUGGESTIONS);
  }, [artworks, query]);

  const showDropdown = focused && query.trim().length > 0 && !loading;

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleFocus = () => {
    clearBlurTimeout();
    setFocused(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setFocused(false), 150);
  };

  const goToPaintingsSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      navigate('/paintings');
      return;
    }
    navigate(`/paintings?search=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToPaintingsSearch(query);
    setFocused(false);
  };

  const selectArtwork = (id: string) => {
    clearBlurTimeout();
    setFocused(false);
    setQuery('');
    navigate(`/paintings?artwork=${encodeURIComponent(id)}`);
  };

  return (
    <div className="w-full">
      <h2 className="font-serif text-xl md:text-2xl text-primary text-center mb-4">
        Search paintings
      </h2>
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor="home-painting-search" className="sr-only">
          Search paintings by title, medium, or artist
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <input
            id="home-painting-search"
            type="search"
            name="q"
            autoComplete="off"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search paintings by title, medium, or artist..."
            className={cn(
              'w-full rounded-sm border border-border bg-card py-3 pl-10 pr-3 text-sm font-sans text-foreground',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'
            )}
          />
        </div>

        {showDropdown && (
          <ul
            role="listbox"
            className="absolute z-40 mt-1 w-full rounded-sm border border-border bg-card shadow-md max-h-[min(20rem,50vh)] overflow-y-auto"
          >
            {suggestions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">No paintings match</li>
            ) : (
              suggestions.map((artwork) => (
                <li key={artwork.id} role="option">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-secondary/80 transition-colors border-b border-border/60 last:border-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectArtwork(artwork.id)}
                  >
                    <span className="font-medium text-primary line-clamp-1">{artwork.title}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {[artwork.medium, artwork.artist].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </form>
      <p className="text-center text-xs sm:text-sm italic text-muted-foreground font-sans tracking-wide mt-4">
        Powered by Rasayan Studio
      </p>
    </div>
  );
}
