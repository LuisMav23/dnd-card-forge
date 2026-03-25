import Skeleton from '@/components/ui/Skeleton';

export default function ProfilePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1">
        <header className="mb-8 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-48 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </header>
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-28 w-28 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="surface-card space-y-6 p-6 sm:p-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2 border-b border-bdr/60 pb-6 last:border-0 last:pb-0">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
