import { useState } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_ZOOM = 5;

interface PaintingZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Magnification factor when hovering (default 5). */
  zoomScale?: number;
}

export function PaintingZoomImage({
  src,
  alt,
  className,
  imgClassName,
  zoomScale = DEFAULT_ZOOM,
}: PaintingZoomImageProps) {
  const [hover, setHover] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div
      className={cn(
        'relative inline-block max-w-full overflow-hidden cursor-zoom-in select-none',
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={cn(
          'block w-full h-auto max-h-[70vh] md:max-h-[85vh] object-contain will-change-transform',
          imgClassName
        )}
        style={{
          transform: hover ? `scale(${zoomScale})` : 'scale(1)',
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: hover ? 'transform 0.05s linear' : 'transform 0.2s ease-out',
        }}
      />
    </div>
  );
}
