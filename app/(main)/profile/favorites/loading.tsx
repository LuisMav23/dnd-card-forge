import PageLoadShell from '@/components/ui/PageLoadShell';
import FavoritesPageSkeleton from '@/components/ui/skeletons/FavoritesPageSkeleton';

export default function ProfileFavoritesLoading() {
  return (
    <PageLoadShell label="Loading favorites" mainClassName="flex min-h-0 flex-1 flex-col bg-bg px-0 py-0">
      <FavoritesPageSkeleton />
    </PageLoadShell>
  );
}
