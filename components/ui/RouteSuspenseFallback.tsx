import Skeleton from './Skeleton';

export default function RouteSuspenseFallback() {
  return (
    <div
      className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-bg px-6"
      role="status"
      aria-busy="true"
    >
      <span className="sr-only">Loading page</span>
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-full max-w-xs" />
        <Skeleton className="h-3 w-4/5 max-w-xs" />
        <Skeleton className="mt-4 h-32 w-full max-w-sm rounded-lg" />
      </div>
    </div>
  );
}
