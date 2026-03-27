import Skeleton from '@/components/ui/Skeleton';

export default function HomeHubSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex w-full flex-col items-center gap-2 sm:items-start">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-48 max-w-full sm:w-56" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <li key={i} className="overflow-hidden rounded-xl border border-bdr/50 bg-panel/40">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
