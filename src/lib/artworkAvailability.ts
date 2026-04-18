import type { Artwork } from '@/hooks/useArtworks';
import type { PaintingCategory } from '@/hooks/useCategories';

/** Shown in place of Add to Cart / sold-out copy when the work is not purchasable on-site. */
export const POWERED_BY_RASAYAN_TAGLINE = 'Powered by Rasayan studios';

export function categoryForArtwork(
  artwork: Artwork,
  categories: PaintingCategory[]
): PaintingCategory | undefined {
  if (!artwork.category_id) return undefined;
  return categories.find((c) => c.id === artwork.category_id);
}

export function isNotForSaleCategory(category: PaintingCategory | undefined): boolean {
  if (!category) return false;
  const name = category.name.toLowerCase();
  const slug = (category.slug || '').toLowerCase();
  return (
    name.includes('not for sale') ||
    slug.includes('not-for-sale') ||
    slug.includes('not_for_sale') ||
    slug === 'notforsale'
  );
}

function isNotForSaleStatus(artwork: Artwork): boolean {
  const s = (artwork.status || '').toLowerCase();
  return s.includes('not for sale');
}

/** Sold-out works, or works in a not-for-sale category / status — show Rasayan tagline instead of cart. */
export function shouldShowPoweredByRasayan(
  artwork: Artwork,
  categories: PaintingCategory[]
): boolean {
  if (artwork.sold) return true;
  if (isNotForSaleStatus(artwork)) return true;
  return isNotForSaleCategory(categoryForArtwork(artwork, categories));
}
