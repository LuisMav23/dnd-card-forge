import Skeleton from '@/components/ui/Skeleton';

/**
 * Matches `CardWikiView` / `MtgWikiView`: `article.wiki-card-page`, rounded panel, `lg:grid-cols-12`.
 * Use when the route already renders its own top toolbar; this is body-only.
 */
export default function WikiDetailBodySkeleton() {
  return (
    <article className="wiki-card-page mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
      <div className="rounded-2xl border border-bdr bg-panel/90 p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <header className="space-y-4 pr-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full max-w-sm sm:h-12" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-48" />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-4 w-24" />
              </div>
            </header>
            <Skeleton className="aspect-[559/256] w-full rounded-lg" />
            <section className="flex flex-col gap-4">
              <Skeleton className="h-3 w-32" />
              <div className="overflow-hidden rounded-xl border border-bdr bg-prev px-3 py-6 sm:px-5 sm:py-8">
                <Skeleton className="mx-auto h-[min(320px,42vh)] w-[200px] max-w-full rounded-lg" />
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-12 lg:col-span-7">
            <section>
              <Skeleton className="mb-5 h-3 w-36" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full max-w-[96%]" />
                <Skeleton className="h-4 w-4/5 max-w-full" />
              </div>
            </section>
            <section>
              <Skeleton className="mb-5 h-3 w-28" />
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="rounded-xl border border-bdr/80 bg-mid/50 px-4 py-4 sm:px-5"
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-6 w-24" />
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
