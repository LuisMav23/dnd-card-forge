import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterListSkeleton from '@/components/ui/skeletons/EncounterListSkeleton';

export default function CardHubLoading() {
  return (
    <PageLoadShell label="Loading Card Forge">
      <EncounterListSkeleton />
    </PageLoadShell>
  );
}
