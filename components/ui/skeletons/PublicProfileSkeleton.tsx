import Skeleton from '@/components/ui/Skeleton';
import { ExploreItemTileSkeleton } from '@/components/ui/skeletons/ExploreSectionSkeleton';

/** Public user profile: toolbar, avatar block, published grid placeholder. */
export default function PublicProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <header className="mt-8 flex flex-col gap-6 border-b border-bdr/80 pb-8 sm:flex-row sm:items-start">
        <Skeleton className="h-28 w-28 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-20 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-4 pt-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </header>

      <section className="mt-10">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ExploreItemTileSkeleton key={i} />
          ))}
        </ul>
      </section>
    </div>
  );
}
