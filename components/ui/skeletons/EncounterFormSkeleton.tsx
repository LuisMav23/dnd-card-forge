import Skeleton from '@/components/ui/Skeleton';

export function EncounterFormToolbarSkeleton() {
  return (
    <div className="mx-auto mb-8 w-full max-w-2xl space-y-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-9 w-48 max-w-full" />
      <Skeleton className="h-4 w-full max-w-lg" />
    </div>
  );
}

export function EncounterFormFieldsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
      <div className="surface-card space-y-4 p-5">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="flex flex-col gap-3 border-b border-bdr/50 pb-4 last:border-0 sm:flex-row sm:items-end"
          >
            <Skeleton className="h-11 min-w-0 flex-1 rounded-md" />
            <Skeleton className="h-11 w-full rounded-md sm:w-24" />
            <Skeleton className="h-10 w-full rounded-md sm:w-10" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-11 w-36 rounded-lg" />
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export default function EncounterFormSkeleton() {
  return (
    <>
      <EncounterFormToolbarSkeleton />
      <EncounterFormFieldsSkeleton />
    </>
  );
}
