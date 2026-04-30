import type { SVGProps } from 'react';

/** Medium-inspired mark and Goodreads mark. */

type IconProps = { size?: number } & SVGProps<SVGSVGElement>;

export function MediumBrandIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#000" />
      <text
        x="11.9"
        y="14.65"
        fill="#fff"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="-0.3"
        textAnchor="middle"
      >
        Me
      </text>
    </svg>
  );
}

export function GoodreadsBrandIcon({ size = 18, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M11.43 23.995c-3.608-.208-6.274-2.077-6.448-5.078.695.007 1.375-.013 2.07-.006.224 1.342 1.065 2.43 2.683 3.026 1.583.496 3.737.46 5.082-.174 1.351-.636 2.145-1.822 2.503-3.577.212-1.042.236-1.734.231-2.92l-.005-1.631h-.059c-1.245 2.564-3.315 3.53-5.59 3.475-5.74-.054-7.68-4.534-7.528-8.606.01-5.241 3.22-8.537 7.557-8.495 2.354-.14 4.605 1.362 5.554 3.37l.059.002.002-2.918 2.099.004-.002 15.717c-.193 7.04-4.376 7.89-8.209 7.811zm6.1-15.633c-.096-3.26-1.601-6.62-5.503-6.645-3.954-.017-5.625 3.592-5.604 6.85-.013 3.439 1.643 6.305 4.703 6.762 4.532.591 6.551-3.411 6.404-6.967z"
      />
    </svg>
  );
}
