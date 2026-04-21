/**
 * Loading skeleton components for Medium posts.
 * Uses Tailwind's animate-pulse to simulate content loading.
 */

/** Generic skeleton block with shimmer animation. */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm bg-muted ${className}`}
    >
      {/* Shimmer sweep — uses the custom `shimmer` keyframe from tailwind.config.ts */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** Skeleton for a standard grid card. */
export function MediumPostCardSkeleton() {
  return (
    <div className="bg-card rounded-sm overflow-hidden shadow-soft h-full flex flex-col animate-pulse">
      {/* Thumbnail */}
      <SkeletonBlock className="aspect-[16/10] shrink-0" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Tags */}
        <div className="flex gap-2">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-12" />
        </div>

        {/* Date */}
        <SkeletonBlock className="h-3 w-28" />

        {/* Title */}
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-5 w-3/4" />

        {/* Description */}
        <div className="flex flex-col gap-2 mt-1 flex-1">
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-full" />
          <SkeletonBlock className="h-3.5 w-2/3" />
        </div>

        {/* CTA */}
        <SkeletonBlock className="h-4 w-24 mt-2" />
      </div>
    </div>
  );
}

/** Skeleton for the large featured hero card. */
export function MediumFeaturedSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-0 items-center bg-card rounded-sm overflow-hidden shadow-soft animate-pulse max-w-5xl mx-auto">
      {/* Thumbnail */}
      <SkeletonBlock className="aspect-[4/3] md:h-72" />

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col gap-4">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="h-4 w-32" />
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-7 w-full" />
          <SkeletonBlock className="h-7 w-5/6" />
          <SkeletonBlock className="h-7 w-4/6" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
        <SkeletonBlock className="h-5 w-36 mt-1" />
      </div>
    </div>
  );
}
