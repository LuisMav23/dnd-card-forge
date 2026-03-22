import Skeleton from './Skeleton';

export default function ForgeLibraryLoadSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="workspace flex min-h-0 min-h-[240px] flex-1 flex-col overflow-hidden lg:flex-row"
    >
      <span className="sr-only">Loading library item</span>
      {/* Example panel column (desktop only; matches .ex-panel hidden on small screens) */}
      <div className="hidden w-[300px] min-w-[300px] flex-col gap-3 border-r border-bdr bg-panel p-4 lg:flex">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      {/* Form column */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden bg-mid p-5">
        <div className="space-y-3 rounded-lg border border-bdr bg-panel p-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-bdr bg-panel p-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      {/* Preview column */}
      <div className="flex w-full min-w-0 flex-col items-center gap-3 border-t border-bdr bg-prev/80 p-4 lg:w-[290px] lg:min-w-[290px] lg:border-l lg:border-t-0">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-[min(420px,50vh)] w-[200px] rounded-xl" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
