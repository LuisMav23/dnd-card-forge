import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterFormSkeleton from '@/components/ui/skeletons/EncounterFormSkeleton';

export default function NewEncounterLoading() {
  return (
    <PageLoadShell label="Loading">
      <EncounterFormSkeleton />
    </PageLoadShell>
  );
}
