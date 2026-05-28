import { SkeletonList } from '@/components/ui/skeleton';

/**
 * Root loading.tsx — shown during initial server-rendered page load.
 * Per-route loading states should override this for layout-aware skeletons.
 */
export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream py-10">
      <div className="container-page max-w-5xl">
        <div className="card p-6 mb-6">
          <div className="h-7 w-1/3 rounded bg-cream-dark/40 animate-pulse mb-3" />
          <div className="h-4 w-1/2 rounded bg-cream-dark/40 animate-pulse" />
        </div>
        <SkeletonList rows={4} />
      </div>
    </div>
  );
}
