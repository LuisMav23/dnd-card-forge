import Skeleton from '@/components/ui/Skeleton';
import {
  ExploreLeaderboardColumnSkeleton,
  ExploreSectionSkeleton,
} from '@/components/ui/skeletons/ExploreSectionSkeleton';

function SectionHeadingSkeleton() {
  return (
    <div className="mb-4 border-b border-bdr/80 pb-3">
      <Skeleton className="h-7 w-48 max-w-full sm:h-8" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
    </div>
  );
}

/**
 * Full Explore hub: header + following + leaderboard + three grid sections.
 * Used by `app/(main)/explore/loading.tsx` and mirrors `explore/page.tsx` layout.
 */
export default function ExplorePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-10 flex flex-col gap-4 border-b border-bdr/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-48 max-w-full sm:h-12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 max-w-full" />
        </div>
        <Skeleton className="h-11 w-44 shrink-0 rounded-lg" />
      </header>

      <section className="mb-14">
        <SectionHeadingSkeleton />
        <ExploreSectionSkeleton count={3} />
      </section>

      <section className="mb-14">
        <SectionHeadingSkeleton />
        <div className="grid gap-10 lg:grid-cols-2">
          <ExploreLeaderboardColumnSkeleton />
          <ExploreLeaderboardColumnSkeleton />
        </div>
      </section>

      {[1, 2, 3].map(section => (
        <section key={section} className="mb-14">
          <SectionHeadingSkeleton />
          <ExploreSectionSkeleton count={6} />
        </section>
      ))}
    </div>
  );
}
