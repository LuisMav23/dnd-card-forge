import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterListSkeleton from '@/components/ui/skeletons/EncounterListSkeleton';

export default function EncountersLoading() {
  return (
    <PageLoadShell label="Loading encounters">
      <EncounterListSkeleton />
    </PageLoadShell>
  );
}
