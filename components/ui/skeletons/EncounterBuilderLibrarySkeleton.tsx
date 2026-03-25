import Skeleton from '@/components/ui/Skeleton';

export default function EncounterBuilderLibrarySkeleton() {
  return (
    <div className="mt-4 space-y-3" aria-hidden>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-bdr bg-panel/80 p-3 sm:flex-nowrap"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="w-24 space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}
