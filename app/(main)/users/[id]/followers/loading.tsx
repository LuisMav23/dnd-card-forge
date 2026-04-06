import PageLoadShell from '@/components/ui/PageLoadShell';
import FollowersFollowingPageSkeleton from '@/components/ui/skeletons/FollowersFollowingPageSkeleton';

export default function UserFollowersLoading() {
  return (
    <PageLoadShell label="Loading followers" mainClassName="flex min-h-0 flex-1 flex-col bg-bg px-0 py-0">
      <FollowersFollowingPageSkeleton />
    </PageLoadShell>
  );
}
