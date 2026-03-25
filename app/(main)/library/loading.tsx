import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';

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
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <li key={i} className="surface-card flex flex-col p-5 sm:p-6">
                <div className="mb-4 flex justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-[75%]" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
                </div>
                <Skeleton className="mb-5 h-4 w-2/3" />
                <div className="mt-auto space-y-2 border-t border-bdr/80 pt-4">
                  <Skeleton className="h-9 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-12 shrink-0" />
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
