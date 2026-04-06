import PageLoadShell from '@/components/ui/PageLoadShell';
import ProfilePageSkeleton from '@/components/ui/skeletons/ProfilePageSkeleton';

export default function ProfileEditLoading() {
  return (
    <PageLoadShell label="Loading profile editor">
      <ProfilePageSkeleton />
    </PageLoadShell>
  );
}
