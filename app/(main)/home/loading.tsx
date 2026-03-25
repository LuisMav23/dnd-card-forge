import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';
import HomeHubSkeleton from '@/components/ui/skeletons/HomeHubSkeleton';

export default function HomeLoading() {
  return (
    <PageLoadShell label="Loading home">
      <div className="flex min-h-0 flex-1 flex-col">
        <HomeHubSkeleton />
        <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-3 text-center">
          <Skeleton className="mx-auto h-3 w-52 max-w-full opacity-80" shimmer={false} />
        </footer>
      </div>
    </PageLoadShell>
  );
}
