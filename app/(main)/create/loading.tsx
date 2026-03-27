import PageLoadShell from '@/components/ui/PageLoadShell';
import Skeleton from '@/components/ui/Skeleton';

export default function CreateLoading() {
  return (
    <PageLoadShell label="Loading create">
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-12">
          <Skeleton className="h-3 w-56 sm:h-4" />
          <div className="page-hero-divider" aria-hidden />
          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
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
        <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-3 text-center">
          <Skeleton className="mx-auto h-3 w-52 max-w-full opacity-80" shimmer={false} />
        </footer>
      </div>
    </PageLoadShell>
  );
}
