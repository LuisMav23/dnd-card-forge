'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Row = {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export default function UserFollowingPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${id}/following?limit=50`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        if (!cancelled) setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        <Link
          href={`/users/${id}`}
          className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
        >
          ← Profile
        </Link>
        <h1 className="mt-6 font-[var(--font-cinzel),serif] text-xl font-bold text-gold">Following</h1>
        {loading && <p className="mt-6 text-sm text-muted">Loading…</p>}
        {error && <p className="mt-6 text-sm text-red-300">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="mt-6 text-sm text-bronze">Not following anyone yet.</p>
        )}
        <ul className="mt-6 flex flex-col gap-3">
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
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-[var(--font-cinzel),serif] text-sm font-semibold text-gold">{name}</p>
                    {u.bio?.trim() ? (
                      <p className="truncate text-xs text-bronze">{u.bio.trim()}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
