import Skeleton from '@/components/ui/Skeleton';
import WikiDetailBodySkeleton from '@/components/ui/skeletons/WikiDetailBodySkeleton';

/** Explore published preview: top bar (back + title) + wiki-style body. */
export default function ExplorePublishedDetailSkeleton() {
  return (
    <>
      <div className="border-b border-bdr bg-panel/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-full max-w-xl sm:h-8" />
        </div>
      </div>
      <WikiDetailBodySkeleton />
    </>
  );
}
