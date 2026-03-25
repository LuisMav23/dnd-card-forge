import Skeleton from '@/components/ui/Skeleton';

export default function HomeHubSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-12">
      <Skeleton className="h-3 w-40 sm:h-4" />
      <div className="page-hero-divider" aria-hidden />
      <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="surface-card flex flex-col items-center gap-4 p-8">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <div className="w-full space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
