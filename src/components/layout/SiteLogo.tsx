import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface SiteLogoProps {
  className?: string;
  imageClassName?: string;
  ariaLabel?: string;
}

export function SiteLogo({
  className,
  imageClassName,
  ariaLabel = 'Rasayan Studio home',
}: SiteLogoProps) {
  return (
    <Link to="/" className={cn('inline-flex items-center hover:opacity-80 transition-opacity', className)} aria-label={ariaLabel}>
      <img
        src={logo}
        alt="Rasayan Studio"
        className={cn('block w-auto object-contain', imageClassName)}
      />
    </Link>
  );
}
