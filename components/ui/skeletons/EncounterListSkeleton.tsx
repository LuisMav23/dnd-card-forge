import Skeleton from '@/components/ui/Skeleton';
import EncounterListRowsSkeleton from './EncounterListRowsSkeleton';

export default function EncounterListSkeleton() {
  return (
    <>
      <header className="mx-auto mb-8 flex w-full max-w-3xl flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
      </header>
      <EncounterListRowsSkeleton />
    </>
  );
}
