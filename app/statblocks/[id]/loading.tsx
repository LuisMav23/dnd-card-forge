import PageLoadShell from '@/components/ui/PageLoadShell';
import WikiDetailSkeleton from '@/components/ui/skeletons/WikiDetailSkeleton';

export default function StatBlockWikiLoading() {
  return (
    <PageLoadShell
      label="Loading stat block"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-x-hidden px-0 py-0 sm:px-0 sm:py-0"
    >
      <WikiDetailSkeleton />
    </PageLoadShell>
  );
}
