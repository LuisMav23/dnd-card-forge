import PageLoadShell from '@/components/ui/PageLoadShell';
import EncounterFormSkeleton from '@/components/ui/skeletons/EncounterFormSkeleton';

export default function EditEncounterLoading() {
  return (
    <PageLoadShell label="Loading encounter editor">
      <EncounterFormSkeleton />
    </PageLoadShell>
  );
}
