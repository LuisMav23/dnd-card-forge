import Skeleton from '@/components/ui/Skeleton';

export function EncounterSessionToolbarSkeleton() {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-[1600px] flex-wrap items-start justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function EncounterSessionLinesSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {[1, 2].map(line => (
        <div key={line} className="surface-card space-y-5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-11 w-11 rounded-lg" />
              <Skeleton className="h-11 w-11 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {[1, 2, 3].map(cell => (
              <div key={cell} className="flex min-w-0 flex-col gap-3">
                <Skeleton className="h-48 w-full rounded-lg sm:h-56" />
                <div className="space-y-2 rounded-lg border border-bdr/60 bg-mid/30 p-3">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EncounterSessionSkeleton() {
  return (
    <>
      <EncounterSessionToolbarSkeleton />
      <EncounterSessionLinesSkeleton />
    </>
  );
}
