import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterListSkeleton from '@/components/ui/skeletons/EncounterListSkeleton';

export default function StatBlocksHubLoading() {
  return (
    <PageLoadShell label="Loading stat blocks">
      <EncounterListSkeleton />
    </PageLoadShell>
  );
}
