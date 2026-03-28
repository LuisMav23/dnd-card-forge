import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

export default function LibraryLoading() {
  return (
    <PageLoadShell
      label="Loading library"
      mainClassName="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-10"
    >
      <header className="mb-8 max-w-4xl">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-0">
        <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-bdr pb-6 lg:w-72 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-12 shrink-0" />
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </nav>
          <Skeleton className="h-12 w-full" />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:pl-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 min-w-[160px] flex-1 sm:max-w-xs" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
          <ul className={ITEM_CARD_GRID_CLASS}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <li key={i} className="list-none flex h-full min-h-0 flex-col">
                <div className="surface-card flex h-full min-h-0 flex-col overflow-hidden p-0">
                  <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-none rounded-t-xl" />
                  <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 p-5 pr-10 pt-4 sm:p-6 sm:pr-11 sm:pt-5">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-[85%]" />
                      <Skeleton className="h-3 w-3/5" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLoadShell>
  );
}
