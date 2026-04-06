import Skeleton from '@/components/ui/Skeleton';

/** Rows matching `FollowersFollowingClient` list links (avatar + name + bio line). */
export default function FollowersListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <ul className="mt-4 flex flex-col gap-3 pb-8" role="status" aria-label="Loading list">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i}>
          <div className="flex items-center gap-3 rounded-lg border border-bdr bg-panel/80 p-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-full max-w-xs" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
