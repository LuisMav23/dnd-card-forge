import Skeleton from '@/components/ui/Skeleton';

/** Wiki-style main column only (parent page already renders Header + toolbar row). */
export default function WikiDetailBodySkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-3 text-center sm:text-left">
        <Skeleton className="mx-auto h-4 w-48 sm:mx-0" />
        <Skeleton className="mx-auto h-10 w-full max-w-lg sm:mx-0" />
        <Skeleton className="mx-auto h-4 w-2/3 max-w-md sm:mx-0" />
      </div>
      <Skeleton className="mx-auto h-[min(420px,55vh)] w-full max-w-md rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
