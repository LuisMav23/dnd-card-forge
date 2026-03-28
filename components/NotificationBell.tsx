'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { MeNotificationItem, MeNotificationsResponse, NotificationType } from '@/lib/meNotifications';
import { createClient } from '@/lib/supabase/client';

const POLL_MS = 50_000;

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
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

async function fetchNotifications(limit: number, unreadOnly: boolean): Promise<MeNotificationsResponse | null> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (unreadOnly) params.set('unread_only', 'true');
  const res = await fetch(`/api/me/notifications?${params}`, { cache: 'no-store', credentials: 'include' });
  if (!res.ok) return null;
  return (await res.json()) as MeNotificationsResponse;
}

async function markRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await fetch('/api/me/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
}

export default function NotificationBell() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MeNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const refreshBadge = useCallback(async () => {
    const data = await fetchNotifications(1, false);
    if (data) setUnreadCount(data.unread_count);
  }, []);

  const refreshDropdown = useCallback(async () => {
    const data = await fetchNotifications(8, false);
    if (data) {
      setItems(data.items);
      setUnreadCount(data.unread_count);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
    };
    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- single Supabase client pattern matches AuthButton
  }, []);

  useEffect(() => {
    if (!user) return;
    void refreshBadge();
    const id = window.setInterval(() => void refreshBadge(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') void refreshBadge();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user, refreshBadge]);

  useEffect(() => {
    if (user) void refreshBadge();
  }, [pathname, user, refreshBadge]);

  useEffect(() => {
    if (!open || !user) return;
    void refreshDropdown();
  }, [open, user, refreshDropdown]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onItemNavigate = async (n: MeNotificationItem) => {
    if (!n.read_at) {
      await markRead([n.id]);
      setUnreadCount(c => Math.max(0, c - 1));
      setItems(prev => prev.map(x => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    setOpen(false);
    router.push(`/explore/${n.card_id}`);
  };

  if (!user) return null;

  const badge =
    unreadCount > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 font-[var(--font-cinzel),serif] text-[0.55rem] font-bold leading-none text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-bdr-2 bg-panel/90 text-gold-dark transition-colors hover:border-gold-dark hover:bg-mid hover:text-gold dark:text-gold dark:hover:text-gold-light"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <span className="sr-only">Notifications</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {badge}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-1.5 w-[min(calc(100vw-1.5rem),20rem)] rounded-lg border border-bdr bg-panel py-1 shadow-lg"
        >
          <div className="max-h-[min(70vh,22rem)] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-3 py-4 text-center font-[Georgia,serif] text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul className="py-0.5">
                {items.map(n => {
                  const who = n.actor_display_name?.trim() || 'Someone';
                  const title = cardTitleFromMeta(n.metadata);
                  const unread = !n.read_at;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        role="menuitem"
                        className={`w-full px-3 py-2.5 text-left transition-colors hover:bg-mid ${
                          unread ? 'bg-mid/40 dark:bg-mid/60' : ''
                        }`}
                        onClick={() => void onItemNavigate(n)}
                      >
                        <p className="font-[Georgia,serif] text-[0.8rem] leading-snug text-ink dark:text-bronze">
                          <span className="font-semibold text-ink dark:text-gold">{who}</span>{' '}
                          <span className="text-muted">{actionPhrase(n.type)}</span>{' '}
                          <span className="italic text-ink dark:text-gold-light">{title}</span>
                        </p>
                        <p className="mt-0.5 font-[Georgia,serif] text-[0.65rem] text-muted">
                          {formatTime(n.created_at)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-bdr/80 px-2 py-1.5">
            <Link
              href="/notifications"
              role="menuitem"
              className="block rounded px-2 py-2 text-center font-[var(--font-cinzel),serif] text-xs font-semibold tracking-[.08em] uppercase text-gold-dark hover:bg-mid dark:text-gold"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
