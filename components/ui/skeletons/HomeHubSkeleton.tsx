import Skeleton from '@/components/ui/Skeleton';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

export default function HomeHubSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex w-full flex-col items-center gap-2 sm:items-start">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48 max-w-full sm:w-56" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <ul className={`mt-6 ${ITEM_CARD_GRID_CLASS}`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <li
              key={i}
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr/50 bg-panel/40"
            >
              <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-none" />
              <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-auto h-3 w-4/5 max-w-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
