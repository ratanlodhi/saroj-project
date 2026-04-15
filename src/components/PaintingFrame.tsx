import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export type FrameStyle = 'classic-wood' | 'ornate-gold' | 'modern-slate' | 'gallery-white';
export type Orientation = 'horizontal' | 'square' | 'vertical';

interface PaintingFrameProps {
  imageUrl: string;
  alt: string;
  orientation?: Orientation;
  frameStyle?: FrameStyle;
  /** Show the frame-switcher toggle buttons on hover */
  allowFrameSwitch?: boolean;
  /**
   * Tighter frame mat + max width for modals / phones so the piece does not dominate the viewport.
   */
  compact?: boolean;
  className?: string;
  onClick?: () => void;
  /** Extra class applied to the img element */
  imgClassName?: string;
}

// ─── Frame style configs ────────────────────────────────────────────────────

const FRAME_CONFIGS: Record<
  FrameStyle,
  {
    label: string;
    /** Outer wrapper CSS */
    outer: React.CSSProperties;
    /** Thin liner between frame face and canvas */
    liner: React.CSSProperties;
    /** Inner canvas background */
    canvas: React.CSSProperties;
  }
> = {
  'classic-wood': {
    label: 'Wood',
    outer: {
      background:
        'linear-gradient(135deg, #1E0C02 0%, #4A1F07 18%, #8C4A1A 36%, #C8783A 50%, #8C4A1A 64%, #4A1F07 82%, #1E0C02 100%)',
      padding: '18px',
      boxShadow:
        '0 0 0 2px #0A0400, 0 0 0 4px rgba(200,120,58,0.35), 0 18px 60px rgba(0,0,0,0.65), inset 0 1px 3px rgba(255,220,160,0.2)',
      borderRadius: '2px',
    },
    liner: {
      background: '#0D0600',
      padding: '3px',
    },
    canvas: {
      background: '#F5F0E8',
    },
  },

  'ornate-gold': {
    label: 'Gold',
    outer: {
      background:
        'linear-gradient(135deg, #5C4000 0%, #A67C00 20%, #D4AF37 40%, #FFD700 50%, #D4AF37 60%, #A67C00 80%, #5C4000 100%)',
      padding: '22px',
      boxShadow:
        '0 0 0 2px #3A2800, 0 0 0 5px rgba(212,175,55,0.5), 0 0 0 7px #3A2800, 0 20px 70px rgba(0,0,0,0.7), inset 0 1px 4px rgba(255,248,180,0.3)',
      borderRadius: '1px',
    },
    liner: {
      background: '#2A1E00',
      padding: '4px',
    },
    canvas: {
      background: '#FDFAF2',
    },
  },

  'modern-slate': {
    label: 'Slate',
    outer: {
      background: 'linear-gradient(160deg, #2A2D35 0%, #1C1F26 40%, #12141A 100%)',
      padding: '14px',
      boxShadow:
        '0 0 0 1px #080A0E, 0 16px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
      borderRadius: '3px',
    },
    liner: {
      background: '#080A0E',
      padding: '2px',
    },
    canvas: {
      background: '#F8F8F8',
    },
  },

  'gallery-white': {
    label: 'Gallery',
    outer: {
      background: 'linear-gradient(135deg, #E8E4DC 0%, #F5F2EC 30%, #FFFFFF 50%, #F5F2EC 70%, #E8E4DC 100%)',
      padding: '16px',
      boxShadow:
        '0 0 0 1px #C8C0B0, 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.1)',
      borderRadius: '1px',
    },
    liner: {
      background: '#B0A898',
      padding: '2px',
    },
    canvas: {
      background: '#FFFEFB',
    },
  },
};

// ─── Default frame per orientation ──────────────────────────────────────────

const DEFAULT_FRAME: Record<Orientation, FrameStyle> = {
  horizontal: 'classic-wood',
  square: 'ornate-gold',
  vertical: 'modern-slate',
};


// ─── Auto-detect orientation from image dimensions ───────────────────────────

/** Infer landscape / square / portrait from pixel dimensions (public for admin fallback). */
export function detectOrientationFromUrl(imageUrl: string): Promise<Orientation> {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve('horizontal');
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.1) resolve('horizontal');
      else if (ratio < 0.9) resolve('vertical');
      else resolve('square');
    };
    img.onerror = () => resolve('horizontal');
    img.src = imageUrl;
  });
}

/**
 * Frame designs are partitioned by orientation (horizontal ∩ square = ∅):
 * - Landscape: wood + slate (wide opening reads as a horizontal frame).
 * - Square: gold + gallery (only these appear for square aspect).
 * - Portrait: same wood + slate as landscape; the portrait canvas (3/4) distinguishes them.
 */
const FRAME_STYLES_BY_ORIENTATION: Record<Orientation, FrameStyle[]> = {
  horizontal: ['classic-wood', 'modern-slate'],
  square: ['ornate-gold', 'gallery-white'],
  vertical: ['classic-wood', 'modern-slate'],
};

// ─── Component ───────────────────────────────────────────────────────────────

export function PaintingFrame({
  imageUrl,
  alt,
  orientation: orientationProp,
  frameStyle: frameStyleProp,
  allowFrameSwitch = false,
  compact = false,
  className,
  onClick,
  imgClassName,
}: PaintingFrameProps) {
  /** From actual image pixels — drives frame shape so a portrait file is never forced into a landscape opening. */
  const [orientationFromImage, setOrientationFromImage] = useState<Orientation | null>(null);
  const [activeFrame, setActiveFrame] = useState<FrameStyle | null>(null);
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setOrientationFromImage(null);
      return;
    }
    detectOrientationFromUrl(imageUrl).then(setOrientationFromImage);
  }, [imageUrl]);

  // Prefer measured pixels over DB (admin value can be wrong); fall back to prop, then landscape.
  const orientation: Orientation = orientationFromImage ?? orientationProp ?? 'horizontal';

  const allowedFrames = FRAME_STYLES_BY_ORIENTATION[orientation];

  const resolvedFrame: FrameStyle = useMemo(() => {
    const allowed = FRAME_STYLES_BY_ORIENTATION[orientation];
    const fallback = DEFAULT_FRAME[orientation];
    const candidate = activeFrame ?? frameStyleProp ?? fallback;
    if (allowed.includes(candidate)) return candidate;
    return fallback;
  }, [orientation, activeFrame, frameStyleProp]);

  const prevOrientationRef = useRef<Orientation | null>(null);
  // Clear frame preview only when orientation actually changes (not on Strict Mode remount)
  useEffect(() => {
    const prev = prevOrientationRef.current;
    prevOrientationRef.current = orientation;
    if (prev !== null && prev !== orientation) {
      setActiveFrame(null);
    }
  }, [orientation]);

  const cfg = FRAME_CONFIGS[resolvedFrame];

  const outerStyle: CSSProperties = compact
    ? { ...cfg.outer, padding: 'clamp(6px, 1.8vw, 14px)' }
    : cfg.outer;
  const linerStyle: CSSProperties = compact
    ? { ...cfg.liner, padding: 'clamp(2px, 0.4vw, 3px)' }
    : cfg.liner;

  return (
    <div
      className={cn(
        'relative group',
        compact &&
          'mx-auto w-full max-w-[min(88vw,18rem)] sm:max-w-[min(88vw,24rem)] md:max-w-[min(72vw,34rem)] lg:max-w-full origin-top max-sm:scale-[0.9] sm:scale-95 md:scale-100',
        className,
      )}
      onMouseEnter={() => allowFrameSwitch && setShowSwitcher(true)}
      onMouseLeave={() => allowFrameSwitch && setShowSwitcher(false)}
      onClick={onClick}
    >
      {/* ── Frame face ── */}
      <div style={outerStyle} className="w-full max-w-full transition-all duration-300">
        {/* ── Liner strip ── */}
        <div style={linerStyle} className="w-full max-w-full">
          {/* ── Canvas / painting area — fixed aspect per orientation; image is letterboxed inside ── */}
          <div
            style={cfg.canvas}
            className={cn(
              'relative w-full max-w-full overflow-hidden',
              orientation === 'horizontal' && 'aspect-[16/10]',
              orientation === 'square' && 'aspect-square',
              orientation === 'vertical' && 'aspect-[3/4]',
              compact && 'max-h-[min(40dvh,20rem)] sm:max-h-[min(46dvh,24rem)] md:max-h-none',
            )}
          >
            {/* Mat: inner padding so the art never touches the liner; object-contain sits inside this inset */}
            <div
              className={cn(
                'absolute inset-0 box-border flex items-center justify-center',
                compact ? 'p-[clamp(5px,2.2vmin,18px)]' : 'p-[clamp(12px,5.5vmin,32px)]',
              )}
            >
              <img
                src={imageUrl}
                alt={alt}
                className={cn(
                  'block max-h-full max-w-full h-auto w-auto object-contain object-center transition-transform duration-500',
                  imgClassName,
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Frame switcher (hover) — only styles valid for this orientation ── */}
      {allowFrameSwitch && showSwitcher && (
        <div
          className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 max-w-[calc(100%-1rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {allowedFrames.map((fs) => (
            <button
              key={fs}
              type="button"
              title={FRAME_CONFIGS[fs].label}
              onClick={() => setActiveFrame(fs)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all duration-150',
                fs === resolvedFrame ? 'border-white scale-125' : 'border-white/40 hover:border-white/80',
              )}
              style={{
                background: (FRAME_CONFIGS[fs].outer.background as string) ?? '#888',
              }}
              aria-label={`Switch to ${FRAME_CONFIGS[fs].label} frame`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PaintingFrame;
