import PageLoadShell from '@/components/ui/PageLoadShell';
import PublicProfileSkeleton from '@/components/ui/skeletons/PublicProfileSkeleton';

export default function PublicUserProfileLoading() {
  return (
    <PageLoadShell label="Loading profile" mainClassName="flex min-h-0 flex-1 flex-col bg-bg px-0 py-0">
      <PublicProfileSkeleton />
    </PageLoadShell>
  );
}
