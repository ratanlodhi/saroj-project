import { mediumCategories } from '@/data/artworks';

export type MediumCategoryId = Exclude<(typeof mediumCategories)[number]['id'], 'all'>;

const mediumMatcherByCategory: Record<MediumCategoryId, (medium: string) => boolean> = {
  acrylic: (medium) => medium.includes('acrylic'),
  oil: (medium) => medium.includes('oil'),
  ink: (medium) => medium.includes('ink'),
  gouache: (medium) => medium.includes('gouache'),
  'mixed-media': (medium) => medium.includes('mixed media'),
  charcoal: (medium) => medium.includes('charcoal'),
  'soft-pastel': (medium) => medium.includes('pastel'),
  other: (medium) => medium.includes('other'),
};

export const mediumOrder = mediumCategories
  .filter((medium) => medium.id !== 'all')
  .map((medium) => medium.id) as MediumCategoryId[];

export const resolveMediumCategory = (rawMedium: string): MediumCategoryId | null => {
  const normalizedMedium = rawMedium.toLowerCase();

  for (const mediumId of mediumOrder) {
    const matcher = mediumMatcherByCategory[mediumId];
    if (matcher?.(normalizedMedium)) return mediumId;
  }

  return null;
};

export const getMediumLabel = (mediumId: string) => {
  return mediumCategories.find((medium) => medium.id === mediumId)?.label ?? mediumId;
};

export const filterArtworkByMedium = (rawMedium: string, mediumId: string) => {
  const matcher = mediumMatcherByCategory[mediumId];
  if (!matcher) return true;
  return matcher(rawMedium.toLowerCase());
};
