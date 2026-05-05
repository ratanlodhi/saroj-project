import { cn } from '@/lib/utils';

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
  /** Browsers allow muted autoplay; unmuted autoplay is usually blocked. */
  autoplay?: boolean;
  /** Defer loading until near viewport (good for grids). */
  lazy?: boolean;
}

/**
 * Privacy-enhanced embed (youtube-nocookie.com). Use short video IDs only (no full URLs).
 */
export function YouTubeEmbed({
  videoId,
  title,
  className,
  autoplay = true,
  lazy = false,
}: YouTubeEmbedProps) {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: autoplay ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
  });

  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading={lazy ? 'lazy' : 'eager'}
      className={cn('absolute inset-0 h-full w-full border-0', className)}
    />
  );
}
