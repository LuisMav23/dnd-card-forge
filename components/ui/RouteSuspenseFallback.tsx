import PageLoadShell from './PageLoadShell';
import Skeleton from './Skeleton';

export default function RouteSuspenseFallback() {
  return (
    <PageLoadShell label="Loading page" mainClassName="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-full max-w-xs" />
        <Skeleton className="h-3 w-4/5 max-w-xs" />
        <Skeleton className="mt-4 h-32 w-full max-w-sm rounded-lg" />
      </div>
    </PageLoadShell>
  );
}
