import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';
import StatBlockForgePageSkeleton from '@/components/ui/skeletons/StatBlockForgePageSkeleton';

export default function StatBlocksNewLoading() {
  return (
    <PageLoadShell
      label="Loading Stat Blocks"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-hidden px-0 py-0 sm:px-0 sm:py-0"
    >
      <StatBlockForgePageSkeleton />
      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center">
        <Skeleton className="mx-auto h-3 w-56 max-w-full opacity-70" shimmer={false} />
      </footer>
    </PageLoadShell>
  );
}
