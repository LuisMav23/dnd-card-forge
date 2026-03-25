import Skeleton from '@/components/ui/Skeleton';

export default function EncounterListRowsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-2/3 max-w-xs" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
