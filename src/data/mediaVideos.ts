/**
 * Media page — YouTube video IDs (`v=` in youtube.com/watch or youtu.be/… links).
 */

export interface MediaVideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
}

/** Hero — https://youtu.be/bnLrIO4J8To */
export const MEDIA_FEATURED_VIDEO: MediaVideoItem = {
  id: 'featured',
  youtubeId: 'bnLrIO4J8To',
  title: 'The Art of Abstract Expression',
  description:
    'A documentary exploring the philosophy and technique behind our abstract work.',
};

/** Grid — order matches your links: youtu.be/UOKt3d77oIw … Ro1gKtl7ndQ … XCCzhrsn_ZE … qyvdYnTtBfE */
export const MEDIA_MORE_VIDEOS: MediaVideoItem[] = [
  {
    id: '1',
    youtubeId: 'UOKt3d77oIw',
    title: 'Abstract Painting Process',
    description:
      'Watch the creation of "Whispers of Dawn" from first brushstroke to completion.',
  },
  {
    id: '2',
    youtubeId: 'Ro1gKtl7ndQ',
    title: 'Portrait Study Timelapse',
    description:
      'A mesmerizing timelapse of classical portrait techniques in action.',
  },
  {
    id: '3',
    youtubeId: 'XCCzhrsn_ZE',
    title: 'Studio Tour',
    description: 'An intimate look inside the workspace.',
  },
  {
    id: '4',
    youtubeId: 'qyvdYnTtBfE',
    title: 'Color Mixing Masterclass',
    description: 'Learn the secrets of creating harmonious color palettes.',
  },
];

const _allIds = [
  MEDIA_FEATURED_VIDEO.youtubeId,
  ...MEDIA_MORE_VIDEOS.map((v) => v.youtubeId),
];
if (new Set(_allIds).size !== _allIds.length) {
  console.warn(
    '[mediaVideos] Duplicate youtubeId values — each slot must use a different video.',
  );
}
