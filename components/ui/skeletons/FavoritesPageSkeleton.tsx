import Skeleton from '@/components/ui/Skeleton';
import { ExploreItemTileSkeleton } from '@/components/ui/skeletons/ExploreSectionSkeleton';

/** Profile favorites: back link, title, subtitle, grid of item tiles. */
export default function FavoritesPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-9 w-40 max-w-full" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ExploreItemTileSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
