import { cn } from '@/lib/utils';
import { POWERED_BY_RASAYAN_TAGLINE } from '@/lib/artworkAvailability';

export default function PoweredByRasayanTagline({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs sm:text-sm italic text-muted-foreground font-sans tracking-wide', className)}>
      {POWERED_BY_RASAYAN_TAGLINE}
    </p>
  );
}
