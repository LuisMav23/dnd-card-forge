import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterSessionSkeleton from '@/components/ui/skeletons/EncounterSessionSkeleton';

export default function EncounterSessionLoading() {
  return (
    <PageLoadShell label="Loading encounter session">
      <EncounterSessionSkeleton />
    </PageLoadShell>
  );
}
