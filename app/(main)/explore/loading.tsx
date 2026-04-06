import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';
import ExplorePageSkeleton from '@/components/ui/skeletons/ExplorePageSkeleton';

export default function ExploreLoading() {
  return (
    <PageLoadShell
      label="Loading explore"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-x-hidden px-0 py-0 sm:px-0 sm:py-0"
    >
      <ExplorePageSkeleton />
      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        <Skeleton className="mx-auto h-3 w-52 max-w-full opacity-80" shimmer={false} />
      </footer>
    </PageLoadShell>
  );
}
