'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ExploreItemCard from '@/components/explore/ExploreItemCard';
import { createClient } from '@/lib/supabase/client';
import type { ExploreListItem } from '@/lib/exploreTypes';

type PublicProfile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export default function PublicUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [published, setPublished] = useState<ExploreListItem[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSessionUserId(user?.id ?? null);

      const res = await fetch(`/api/users/${id}/profile`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      setProfile(data.profile as PublicProfile);
      setPublished(Array.isArray(data.published) ? data.published : []);
      setFollowerCount(Number(data.follower_count ?? 0));
      setFollowingCount(Number(data.following_count ?? 0));
      setIsFollowing(Boolean(data.is_following));
      setIsSelf(Boolean(data.is_self));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleFollow = async () => {
    if (!sessionUserId || isSelf || !id) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        const res = await fetch(`/api/users/${id}/follow`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unfollow failed');
      } else {
        const res = await fetch(`/api/users/${id}/follow`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Follow failed');
      }
      const sync = await fetch(`/api/users/${id}/profile`, { cache: 'no-store' });
      const d = await sync.json();
      if (sync.ok) {
        setFollowerCount(Number(d.follower_count ?? 0));
        setIsFollowing(Boolean(d.is_following));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setFollowBusy(false);
    }
  };

  const displayName =
    profile?.full_name?.trim() || profile?.id?.slice(0, 8) || 'Creator';

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <Link
          href="/explore"
          className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
        >
          ← Explore
        </Link>

        {loading && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-24 w-24 rounded-full bg-mid/80" />
            <div className="h-8 w-48 rounded bg-mid/80" />
            <div className="h-20 max-w-xl rounded bg-mid/60" />
          </div>
        )}

        {error && !loading && (
          <div className="mt-8">
            <p className="text-sm text-red-300">{error}</p>
            <Link href="/explore" className="mt-4 inline-block text-gold underline">
              Back to Explore
            </Link>
          </div>
        )}

        {profile && !loading && (
          <>
            <header className="mt-8 flex flex-col gap-6 border-b border-bdr/80 pb-8 sm:flex-row sm:items-start">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-bdr bg-mid shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-[var(--font-cinzel),serif] text-3xl text-gold-dark/50">
                    ?
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold sm:text-3xl">
                  {displayName}
                </h1>
                {profile.bio?.trim() ? (
                  <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-bronze">
                    {profile.bio.trim()}
                  </p>
                ) : (
                  <p className="mt-3 text-sm italic text-muted">No bio yet.</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <Link
                    href={`/users/${id}/followers`}
                    className="text-bronze underline-offset-2 hover:text-gold hover:underline"
                  >
                    {followerCount} followers
                  </Link>
                  <Link
                    href={`/users/${id}/following`}
                    className="text-bronze underline-offset-2 hover:text-gold hover:underline"
                  >
                    {followingCount} following
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {!sessionUserId && (
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="panel-btn text-sm text-gold"
                    >
                      Sign in to follow
                    </button>
                  )}
                  {sessionUserId && !isSelf && (
                    <button
                      type="button"
                      disabled={followBusy}
                      onClick={() => void toggleFollow()}
                      className={`panel-btn text-sm disabled:opacity-50 ${
                        isFollowing
                          ? 'border-bdr bg-transparent text-bronze hover:bg-input'
                          : 'text-gold'
                      }`}
                    >
                      {followBusy ? '…' : isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </header>

            <section className="mt-10" aria-labelledby="published-heading">
              <h2
                id="published-heading"
                className="font-[var(--font-cinzel),serif] text-lg font-bold tracking-wide text-gold"
              >
                Published work
              </h2>
              <p className="mt-1 text-sm text-bronze">Cards and stat blocks shared to Explore.</p>
              {published.length === 0 ? (
                <p className="mt-6 text-sm italic text-muted">Nothing published yet.</p>
              ) : (
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {published.map(item => (
                    <ExploreItemCard key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
