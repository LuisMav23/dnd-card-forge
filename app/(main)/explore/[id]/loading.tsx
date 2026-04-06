import PageLoadShell from '@/components/ui/PageLoadShell';
import ExplorePublishedDetailSkeleton from '@/components/ui/skeletons/ExplorePublishedDetailSkeleton';

export default function ExplorePublishedLoading() {
  return (
    <PageLoadShell
      label="Loading preview"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-x-hidden px-0 py-0 sm:px-0 sm:py-0"
    >
      <ExplorePublishedDetailSkeleton />
    </PageLoadShell>
  );
}
