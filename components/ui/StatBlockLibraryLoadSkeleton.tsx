import Skeleton from './Skeleton';

export default function StatBlockLibraryLoadSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="workspace flex min-h-0 min-h-[240px] flex-1 flex-col overflow-hidden lg:flex-row"
    >
      <span className="sr-only">Loading library item</span>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden bg-mid p-5">
        <div className="space-y-3 rounded-lg border border-bdr bg-panel p-4">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="space-y-2 rounded-lg border border-bdr bg-panel p-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="sb-prev-panel flex w-full min-w-0 flex-col items-center gap-3 border-t border-bdr bg-prev/80 p-4 lg:w-[320px] lg:min-w-[280px] lg:border-l lg:border-t-0">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-[min(480px,55vh)] w-full max-w-[280px] rounded-lg" />
      </div>
    </div>
  );
}
