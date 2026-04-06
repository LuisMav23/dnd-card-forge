import Skeleton from '@/components/ui/Skeleton';

/** Parent supplies page padding (e.g. `main` or `PageLoadShell` main). */
export default function NotificationsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 max-w-full sm:h-9" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <ul className="flex flex-col gap-2" role="status" aria-label="Loading notifications">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <div className="w-full rounded-lg border border-bdr bg-panel/60 px-4 py-3">
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
