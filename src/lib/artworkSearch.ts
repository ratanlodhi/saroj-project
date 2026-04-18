import type { Artwork } from '@/hooks/useArtworks';

/** Same matching rules as the admin ArtworkManager search (title, medium, artist). */
export function artworkMatchesAdminSearch(artwork: Artwork, searchQuery: string): boolean {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return true;
  return (
    artwork.title.toLowerCase().includes(q) ||
    artwork.medium.toLowerCase().includes(q) ||
    (artwork.artist || '').toLowerCase().includes(q)
  );
}

export function filterArtworksByAdminSearch(artworks: Artwork[], searchQuery: string): Artwork[] {
  const q = searchQuery.trim();
  if (!q) return artworks;
  return artworks.filter((a) => artworkMatchesAdminSearch(a, q));
}
