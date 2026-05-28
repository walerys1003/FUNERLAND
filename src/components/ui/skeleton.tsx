import { cn } from '@/lib/utils';

/**
 * Skeleton — placeholder block while content is loading.
 * Uses shimmer animation defined in globals.css (.animate-shimmer).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-cream-dark/40',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
        'before:animate-shimmer',
        className,
      )}
      {...props}
    >
      <span className="sr-only">Ładowanie…</span>
    </div>
  );
}

/** Skeleton text line — single row */
export function SkeletonLine({
  width = 'w-full',
  className,
}: {
  width?: string;
  className?: string;
}) {
  return <Skeleton className={cn('h-3.5', width, className)} />;
}

/** Skeleton card — header + body */
export function SkeletonCard() {
  return (
    <div className="card p-5">
      <Skeleton className="h-5 w-1/2 mb-3" />
      <Skeleton className="h-3 w-full mb-1.5" />
      <Skeleton className="h-3 w-5/6 mb-1.5" />
      <Skeleton className="h-3 w-4/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

/** Skeleton list — N rows */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton company card — matches the listing layout */
export function SkeletonCompanyCard() {
  return (
    <div className="card p-5 flex gap-4">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-3 w-1/3 mb-3" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <div className="text-right shrink-0">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
