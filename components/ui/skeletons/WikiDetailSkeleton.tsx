import Skeleton from '@/components/ui/Skeleton';
import WikiDetailBodySkeleton from './WikiDetailBodySkeleton';

export default function WikiDetailSkeleton() {
  return (
    <>
      <div className="border-b border-bdr bg-panel/80 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <WikiDetailBodySkeleton />
    </>
  );
}
