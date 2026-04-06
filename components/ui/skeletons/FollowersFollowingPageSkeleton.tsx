import Skeleton from '@/components/ui/Skeleton';
import FollowersListSkeleton from '@/components/ui/skeletons/FollowersListSkeleton';

/** Matches `FollowersFollowingClient` shell: back, title, tab bar, list area. */
export default function FollowersFollowingPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col px-4 py-8 sm:px-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-40 max-w-full" />
      <div className="mt-4 flex border-b border-bdr/80">
        <Skeleton className="h-12 flex-1 rounded-none" />
        <Skeleton className="h-12 flex-1 rounded-none" />
      </div>
      <FollowersListSkeleton rows={8} />
    </div>
  );
}
