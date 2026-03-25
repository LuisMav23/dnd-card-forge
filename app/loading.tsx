import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <PageLoadShell
      label="Loading"
      mainClassName="flex flex-1 flex-col items-center justify-center px-6 py-16"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-7 w-52 max-w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-2 h-11 w-full max-w-xs rounded-lg" />
      </div>
    </PageLoadShell>
  );
}
