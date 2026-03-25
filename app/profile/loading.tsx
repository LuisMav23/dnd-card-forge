import PageLoadShell from '@/components/ui/PageLoadShell';
import ProfilePageSkeleton from '@/components/ui/skeletons/ProfilePageSkeleton';

export default function ProfileLoading() {
  return (
    <PageLoadShell label="Loading profile">
      <ProfilePageSkeleton />
    </PageLoadShell>
  );
}
