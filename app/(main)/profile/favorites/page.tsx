'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ExploreItemCard from '@/components/explore/ExploreItemCard';
import { createClient } from '@/lib/supabase/client';
import type { ExploreListItem } from '@/lib/exploreTypes';

export default function ProfileFavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ExploreListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/me/favorites?limit=48', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <Link
          href="/profile"
          className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
        >
          ← Profile
        </Link>
        <h1 className="mt-6 font-[var(--font-cinzel),serif] text-2xl font-bold text-gold">Favorites</h1>
        <p className="mt-2 text-sm text-bronze">Published items you saved from Explore.</p>

        {loading && <p className="mt-8 text-sm text-muted">Loading…</p>}
        {error && <p className="mt-8 text-sm text-red-300">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="mt-8 text-sm italic text-muted">
            No favorites yet. Open something on Explore and tap ♥ Save.
          </p>
        )}
        {!loading && !error && items.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <ExploreItemCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
