import PageLoadShell from '@/components/ui/PageLoadShell';
import NotificationsSkeleton from '@/components/ui/skeletons/NotificationsSkeleton';

export default function NotificationsLoading() {
  return (
    <PageLoadShell
      label="Loading notifications"
      mainClassName="flex min-h-0 flex-1 flex-col bg-bg px-4 py-8 sm:py-10"
    >
      <NotificationsSkeleton />
    </PageLoadShell>
  );
}
