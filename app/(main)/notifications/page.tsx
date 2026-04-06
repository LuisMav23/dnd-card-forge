'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { MeNotificationItem, MeNotificationsResponse, NotificationType } from '@/lib/meNotifications';
import NotificationsSkeleton from '@/components/ui/skeletons/NotificationsSkeleton';

function actionPhrase(type: NotificationType): string {
  switch (type) {
    case 'comment':
      return 'commented on';
    case 'upvote':
      return 'upvoted';
    case 'downvote':
      return 'downvoted';
    case 'favorite':
      return 'saved';
    default:
      return 'interacted with';
  }
}

function cardTitleFromMeta(metadata: Record<string, unknown>): string {
  const t = metadata.card_title;
  return typeof t === 'string' && t.trim() ? t.trim() : 'your card';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function loadList(): Promise<MeNotificationsResponse | null> {
  const res = await fetch('/api/me/notifications?limit=50', { cache: 'no-store', credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return (await res.json()) as MeNotificationsResponse;
}

async function markRead(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  const res = await fetch('/api/me/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
  return res.ok;
}

async function markAllRead(): Promise<boolean> {
  const res = await fetch('/api/me/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ mark_all_read: true }),
  });
  return res.ok;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<MeNotificationsResponse | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await loadList();
    setData(next);
    if (next === null) router.push('/login');
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onRowClick = async (n: MeNotificationItem) => {
    if (!n.read_at) {
      setBusy(true);
      await markRead([n.id]);
      setBusy(false);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1),
          items: prev.items.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)),
        };
      });
    }
    router.push(`/explore/${n.card_id}`);
  };

  const onMarkAll = async () => {
    setBusy(true);
    const ok = await markAllRead();
    setBusy(false);
    if (ok) {
      setData(prev => {
        if (!prev) return prev;
        const ts = new Date().toISOString();
        return {
          unread_count: 0,
          items: prev.items.map(x => ({ ...x, read_at: x.read_at ?? ts })),
        };
      });
    }
  };

  if (data === undefined) {
    return (
      <main
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:py-10"
        role="status"
        aria-label="Loading notifications"
      >
        <span className="sr-only">Loading notifications</span>
        <NotificationsSkeleton />
      </main>
    );
  }

  if (data === null) {
    return null;
  }

  const { items, unread_count } = data;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-[.08em] text-gold-dark dark:text-gold sm:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 font-[Georgia,serif] text-sm text-muted">
            Activity on cards you published.
          </p>
        </div>
        {unread_count > 0 ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-md border border-bdr-2 bg-panel px-3 py-2 font-[var(--font-cinzel),serif] text-xs font-semibold tracking-[.08em] uppercase text-gold-dark transition-colors hover:border-gold-dark hover:bg-mid disabled:opacity-50 dark:text-gold"
            onClick={() => void onMarkAll()}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-bdr bg-panel/80 px-6 py-12 text-center">
          <p className="font-[Georgia,serif] text-muted">No notifications yet.</p>
          <p className="mt-2 font-[Georgia,serif] text-sm text-muted">
            When others comment or react on your published cards, you will see them here.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-block font-[var(--font-cinzel),serif] text-xs font-semibold tracking-[.08em] uppercase text-gold-dark hover:text-gold dark:text-gold"
          >
            Explore
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map(n => {
            const who = n.actor_display_name?.trim() || 'Someone';
            const title = cardTitleFromMeta(n.metadata);
            const unread = !n.read_at;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  disabled={busy}
                  className={`w-full rounded-lg border border-bdr px-4 py-3 text-left transition-colors hover:border-gold-dark/50 hover:bg-mid/60 disabled:opacity-50 ${
                    unread ? 'bg-mid/30 dark:bg-mid/50' : 'bg-panel/60'
                  }`}
                  onClick={() => void onRowClick(n)}
                >
                  <p className="font-[Georgia,serif] text-[0.9rem] leading-snug text-ink dark:text-bronze">
                    <span className="font-semibold text-ink dark:text-gold">{who}</span>{' '}
                    <span className="text-muted">{actionPhrase(n.type)}</span>{' '}
                    <span className="italic text-ink dark:text-gold-light">{title}</span>
                  </p>
                  <p className="mt-1 font-[Georgia,serif] text-xs text-muted">{formatTime(n.created_at)}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
