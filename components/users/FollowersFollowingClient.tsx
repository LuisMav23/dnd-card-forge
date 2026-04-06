'use client';

import Link from 'next/link';
import FollowersListSkeleton from '@/components/ui/skeletons/FollowersListSkeleton';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type FollowTab = 'followers' | 'following';

type Row = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

function UserList({
  users,
  loading,
  error,
  emptyMessage,
}: {
  users: Row[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
}) {
  if (loading) {
    return <FollowersListSkeleton rows={8} />;
  }
  if (error) {
    return <p className="mt-4 text-sm text-red-300">{error}</p>;
  }
  if (users.length === 0) {
    return <p className="mt-4 text-sm text-bronze">{emptyMessage}</p>;
  }
  return (
    <ul className="mt-4 flex flex-col gap-3 pb-8">
      {users.map(u => {
        const name = u.full_name?.trim() || u.id.slice(0, 8);
        return (
          <li key={u.id}>
            <Link
              href={`/users/${u.id}`}
              className="flex items-center gap-3 rounded-lg border border-bdr bg-panel/80 p-3 transition-colors hover:border-gold/35"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-bdr bg-mid">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted">?</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-[var(--font-cinzel),serif] text-sm font-semibold text-gold">{name}</p>
                {u.bio?.trim() ? <p className="truncate text-xs text-bronze">{u.bio.trim()}</p> : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function FollowersFollowingClient({
  profileUserId,
  initialTab,
}: {
  profileUserId: string;
  initialTab: FollowTab;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);

  const [followers, setFollowers] = useState<Row[]>([]);
  const [following, setFollowing] = useState<Row[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [errFollowers, setErrFollowers] = useState<string | null>(null);
  const [errFollowing, setErrFollowing] = useState<string | null>(null);

  const syncTabFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth <= 0) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActiveTab(page <= 0 ? 'followers' : 'following');
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const applyScroll = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      el.scrollLeft = initialTab === 'following' ? w : 0;
      syncTabFromScroll();
    };
    applyScroll();
    requestAnimationFrame(applyScroll);
  }, [initialTab, profileUserId, syncTabFromScroll]);

  useEffect(() => {
    if (!profileUserId) return;
    let cancelled = false;

    (async () => {
      setLoadingFollowers(true);
      setErrFollowers(null);
      try {
        const res = await fetch(`/api/users/${profileUserId}/followers?limit=50`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        if (!cancelled) setFollowers(Array.isArray(data.users) ? data.users : []);
      } catch (e) {
        if (!cancelled) setErrFollowers(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoadingFollowers(false);
      }
    })();

    (async () => {
      setLoadingFollowing(true);
      setErrFollowing(null);
      try {
        const res = await fetch(`/api/users/${profileUserId}/following?limit=50`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        if (!cancelled) setFollowing(Array.isArray(data.users) ? data.users : []);
      } catch (e) {
        if (!cancelled) setErrFollowing(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoadingFollowing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileUserId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => syncTabFromScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [syncTabFromScroll]);

  const goToTab = (tab: FollowTab) => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: tab === 'followers' ? 0 : w, behavior: 'smooth' });
  };

  const tabBtn =
    'relative flex-1 py-3 text-center font-[var(--font-cinzel),serif] text-sm font-semibold uppercase tracking-wider transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg';
  const tabActive = 'text-gold';
  const tabInactive = 'text-bronze hover:text-gold/80';

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col px-4 py-8 sm:px-6">
        <Link
          href={`/users/${profileUserId}`}
          className="shrink-0 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
        >
          ← Profile
        </Link>

        <h1 className="mt-4 shrink-0 font-[var(--font-cinzel),serif] text-xl font-bold text-gold">
          {activeTab === 'followers' ? 'Followers' : 'Following'}
        </h1>

        <div
          className="mt-4 flex shrink-0 border-b border-bdr/80"
          role="tablist"
          aria-label="Followers and following"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'followers'}
            className={`${tabBtn} ${activeTab === 'followers' ? tabActive : tabInactive}`}
            onClick={() => goToTab('followers')}
          >
            Followers
            {activeTab === 'followers' ? (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gold" />
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'following'}
            className={`${tabBtn} ${activeTab === 'following' ? tabActive : tabInactive}`}
            onClick={() => goToTab('following')}
          >
            Following
            {activeTab === 'following' ? (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gold" />
            ) : null}
          </button>
        </div>

        <div
          ref={scrollRef}
          className="mt-2 min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex h-full min-h-0 w-[200%]">
            <section
              className="h-full min-h-0 w-1/2 min-w-[50%] snap-start snap-always overflow-y-auto overscroll-y-contain pr-1"
              aria-label="Followers list"
              role="tabpanel"
              aria-hidden={activeTab !== 'followers'}
            >
              <UserList
                users={followers}
                loading={loadingFollowers}
                error={errFollowers}
                emptyMessage="No followers yet."
              />
            </section>
            <section
              className="h-full min-h-0 w-1/2 min-w-[50%] snap-start snap-always overflow-y-auto overscroll-y-contain pl-1"
              aria-label="Following list"
              role="tabpanel"
              aria-hidden={activeTab !== 'following'}
            >
              <UserList
                users={following}
                loading={loadingFollowing}
                error={errFollowing}
                emptyMessage="Not following anyone yet."
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
