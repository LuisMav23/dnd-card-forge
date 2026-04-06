import Skeleton from '@/components/ui/Skeleton';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

const TILE_SHADOW = 'shadow-[0_4px_20px_rgba(0,0,0,0.2)]';

/** Single Explore grid tile — matches `ExploreItemCard` shell. */
export function ExploreItemTileSkeleton() {
  return (
    <li
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr/60 bg-panel/50 ${TILE_SHADOW}`}
    >
      <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-none rounded-t-xl" />
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 p-3">
        <Skeleton className="h-4 w-3/4 max-w-full" />
        <Skeleton className="mt-auto h-3 w-1/2 max-w-full" />
      </div>
    </li>
  );
}

export function ExploreSectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={ITEM_CARD_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <ExploreItemTileSkeleton key={i} />
      ))}
    </ul>
  );
}

const TOP_RATED_LIST_CLASS = 'flex flex-col gap-3';

export function ExploreLeaderboardColumnSkeleton() {
  return (
    <ul className={TOP_RATED_LIST_CLASS}>
      {Array.from({ length: 4 }, (_, i) => (
        <li
          key={i}
          className={`flex min-h-[5.75rem] flex-row overflow-hidden rounded-xl border border-bdr/60 bg-panel/50 ${TILE_SHADOW}`}
        >
          <Skeleton className="w-[min(38%,10.5rem)] shrink-0 rounded-none rounded-l-xl sm:w-44" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3 sm:pl-4">
            <Skeleton className="h-4 w-4/5 max-w-xs" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1 h-3 w-3/5 max-w-xs" />
          </div>
        </li>
      ))}
    </ul>
  );
}
