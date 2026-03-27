'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { exploreCount, type ExploreListItem, type ExploreSort } from '@/lib/exploreTypes';

async function fetchSection(sort: ExploreSort): Promise<ExploreListItem[]> {
  const res = await fetch(`/api/explore?sort=${sort}&limit=12`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: ExploreListItem[] };
  return json.items ?? [];
}

function ExploreSection({
  title,
  subtitle,
  items,
  loading,
}: {
  title: string;
  subtitle: string;
  items: ExploreListItem[];
  loading: boolean;
}) {
  return (
    <section className="mb-14">
      <div className="mb-4 border-b border-bdr/80 pb-3">
        <h2 className="font-[var(--font-cinzel),serif] text-lg font-bold tracking-wide text-gold sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-bronze">{subtitle}</p>
      </div>
      {loading ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="h-28 animate-pulse rounded-xl border border-bdr/60 bg-panel/50"
            />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="text-sm italic text-muted">Nothing published here yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <li key={item.id} className="list-none">
              <Link
                href={`/explore/${item.id}`}
                className="block rounded-xl border border-bdr bg-gradient-to-b from-panel to-mid/90 p-4 shadow-[0_6px_24px_rgba(0,0,0,0.25)] transition-colors hover:border-gold/35 hover:text-inherit"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <h3 className="truncate font-[var(--font-cinzel),serif] text-sm font-semibold text-gold">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-[var(--font-cinzel),serif] text-[0.65rem] uppercase tracking-wider ${
                        item.item_type === 'card'
                          ? 'border-amber-700/50 bg-amber-950/40 text-amber-200'
                          : 'border-violet-800/50 bg-violet-950/40 text-violet-200'
                      }`}
                    >
                      {item.item_type === 'card' ? 'Card' : 'Stat block'}
                    </span>
                  </div>
                  <p className="truncate text-xs text-bronze">
                    {item.published_author_name?.trim()
                      ? `By ${item.published_author_name.trim()}`
                      : 'Community'}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-[0.7rem] uppercase tracking-wider text-muted">
                    <span>{exploreCount(item.view_count)} views</span>
                    <span>{exploreCount(item.fork_count)} forks</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [newItems, setNewItems] = useState<ExploreListItem[]>([]);
  const [forkedItems, setForkedItems] = useState<ExploreListItem[]>([]);
  const [popularItems, setPopularItems] = useState<ExploreListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [n, f, p] = await Promise.all([
          fetchSection('new'),
          fetchSection('forked'),
          fetchSection('popular'),
        ]);
        if (cancelled) return;
        setNewItems(n);
        setForkedItems(f);
        setPopularItems(p);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <header className="mb-10 flex flex-col gap-4 border-b border-bdr/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
              Community
            </p>
            <h1 className="mt-2 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold [text-shadow:0_0_20px_rgba(201,168,76,0.2)] sm:text-3xl">
              Explore
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-bronze">
              Browse published cards and stat blocks. Open a preview to fork a copy into your library.
            </p>
          </div>
          <Link
            href="/library"
            className="panel-btn shrink-0 border-gold/35 bg-gold/10 text-center text-gold hover:bg-gold/20"
          >
            Publish my own
          </Link>
        </header>

        <ExploreSection
          title="New"
          subtitle="Recently published"
          items={newItems}
          loading={loading}
        />
        <ExploreSection
          title="Most forked"
          subtitle="Copied into libraries the most"
          items={forkedItems}
          loading={loading}
        />
        <ExploreSection
          title="Most popular"
          subtitle="Most views on public previews"
          items={popularItems}
          loading={loading}
        />
      </main>
      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
