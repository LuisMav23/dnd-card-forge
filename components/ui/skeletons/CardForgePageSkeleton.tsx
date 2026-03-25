import Skeleton from '@/components/ui/Skeleton';

/** Matches card forge: TypeBar row + ExamplePanel + FormPanel + LivePreview. */
export default function CardForgePageSkeleton() {
  return (
    <>
      <div className="flex flex-shrink-0 flex-wrap gap-2 border-b border-bdr bg-mid/80 px-3 py-2.5 sm:px-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-8 w-[4.5rem] rounded-md" />
        ))}
      </div>
      <div className="workspace min-h-0 flex-1">
        <div className="ex-panel">
          <div className="ex-hdr flex w-full items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16 rounded" />
          </div>
          <div className="ex-body w-full">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
        <div className="form-panel">
          <div className="fsec space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="fsec space-y-3">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
        <div className="prev-panel">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-[min(360px,45vh)] w-[200px] max-w-full rounded-lg" />
        </div>
      </div>
    </>
  );
}
