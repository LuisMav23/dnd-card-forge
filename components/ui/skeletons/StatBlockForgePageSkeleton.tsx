import Skeleton from '@/components/ui/Skeleton';

/** Stat block forge: type bar + form panel + preview (two columns in workspace). */
export default function StatBlockForgePageSkeleton() {
  return (
    <>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-bdr bg-mid/80 px-3 py-2.5 sm:px-4">
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
      </div>
      <div className="workspace min-h-0 flex-1">
        <div className="form-panel">
          <div className="fsec space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          <div className="fsec space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        <div className="prev-panel sb-prev-panel">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-[min(420px,50vh)] w-full max-w-[280px] rounded-lg" />
        </div>
      </div>
    </>
  );
}
