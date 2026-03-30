'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ExploreItemCard from '@/components/explore/ExploreItemCard';
import ExploreTopRatedRow from '@/components/explore/ExploreTopRatedRow';
import type { ExploreListItem, ExploreSort } from '@/lib/exploreTypes';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

const TOP_RATED_LIST_CLASS = 'flex flex-col gap-3';

async function fetchSection(sort: ExploreSort): Promise<ExploreListItem[]> {
  const res = await fetch(`/api/explore?sort=${sort}&limit=12`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: ExploreListItem[] };
  return json.items ?? [];
}

async function fetchRatedByType(itemType: 'card' | 'statblock', limit: number): Promise<ExploreListItem[]> {
  const res = await fetch(
    `/api/explore?sort=rated&item_type=${itemType}&limit=${limit}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: ExploreListItem[] };
  return json.items ?? [];
}

async function fetchFollowingFeed(): Promise<{ items: ExploreListItem[]; authed: boolean }> {
  const res = await fetch('/api/me/following-feed?limit=12', { cache: 'no-store' });
  if (res.status === 401) return { items: [], authed: false };
  if (!res.ok) return { items: [], authed: true };
  const json = (await res.json()) as { items?: ExploreListItem[] };
  return { items: json.items ?? [], authed: true };
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
        <ul className={ITEM_CARD_GRID_CLASS}>
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr/60 bg-panel/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="aspect-[4/3] shrink-0 animate-pulse bg-mid/90" />
              <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-mid/80" />
                <div className="mt-auto h-3 w-1/2 animate-pulse rounded bg-mid/60" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="text-sm italic text-muted">Nothing published here yet.</p>
      ) : (
        <ul className={ITEM_CARD_GRID_CLASS}>
          {items.map(item => (
            <ExploreItemCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LeaderboardSection({
  topCards,
  topStatblocks,
  loading,
}: {
  topCards: ExploreListItem[];
  topStatblocks: ExploreListItem[];
  loading: boolean;
}) {
  const skeleton = (
    <ul className={TOP_RATED_LIST_CLASS}>
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="flex min-h-[5.75rem] flex-row overflow-hidden rounded-xl border border-bdr/60 bg-panel/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <div className="w-[min(38%,10.5rem)] shrink-0 animate-pulse bg-mid/90 sm:w-44" />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-3 sm:pl-4">
            <div className="h-4 w-4/5 max-w-xs animate-pulse rounded bg-mid/80" />
            <div className="h-3 w-24 animate-pulse rounded bg-mid/60" />
            <div className="mt-1 h-3 w-3/5 animate-pulse rounded bg-mid/50" />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="mb-14">
      <div className="mb-4 border-b border-bdr/80 pb-3">
        <h2 className="font-[var(--font-cinzel),serif] text-lg font-bold tracking-wide text-gold sm:text-xl">
          Top Rated
        </h2>
        <p className="mt-1 text-sm text-bronze">
          Highest-rated published work by net score (upvotes minus downvotes), then total upvotes, then
          publish date.
        </p>
      </div>
      {loading ? (
        <div className="grid gap-10 lg:grid-cols-2">
          <div>{skeleton}</div>
          <div>{skeleton}</div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-[var(--font-cinzel),serif] text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Spell cards
            </h3>
            {topCards.length === 0 ? (
              <p className="text-sm italic text-muted">No rated spell cards yet. Vote on explore previews.</p>
            ) : (
              <ul className={TOP_RATED_LIST_CLASS}>
                {topCards.map((item, i) => (
                  <ExploreTopRatedRow key={item.id} item={item} rank={i + 1} />
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 font-[var(--font-cinzel),serif] text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
              Stat blocks
            </h3>
            {topStatblocks.length === 0 ? (
              <p className="text-sm italic text-muted">No rated stat blocks yet. Vote on explore previews.</p>
            ) : (
              <ul className={TOP_RATED_LIST_CLASS}>
                {topStatblocks.map((item, i) => (
                  <ExploreTopRatedRow key={item.id} item={item} rank={i + 1} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FollowingFeedSection({
  items,
  loading,
  authed,
}: {
  items: ExploreListItem[];
  loading: boolean;
  authed: boolean;
}) {
  return (
    <section className="mb-14">
      <div className="mb-4 border-b border-bdr/80 pb-3">
        <h2 className="font-[var(--font-cinzel),serif] text-lg font-bold tracking-wide text-gold sm:text-xl">
          From people you follow
        </h2>
        <p className="mt-1 text-sm text-bronze">Recently published work by creators you follow.</p>
      </div>
      {!authed ? (
        <div className="rounded-xl border border-dashed border-bdr/80 bg-panel/40 p-6 text-center">
          <p className="text-sm text-bronze">Sign in to see new posts from people you follow.</p>
          <Link href="/login" className="mt-4 inline-block panel-btn text-gold">
            Sign in
          </Link>
        </div>
      ) : loading ? (
        <ul className={ITEM_CARD_GRID_CLASS}>
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr/60 bg-panel/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              <div className="aspect-[4/3] shrink-0 animate-pulse bg-mid/90" />
              <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-mid/80" />
                <div className="mt-auto h-3 w-1/2 animate-pulse rounded bg-mid/60" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="text-sm italic text-muted">
          No new publishes yet. Follow creators from their public profile, then check back here.
        </p>
      ) : (
        <ul className={ITEM_CARD_GRID_CLASS}>
          {items.map(item => (
            <ExploreItemCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [newItems, setNewItems] = useState<ExploreListItem[]>([]);
  const [forkedItems, setForkedItems] = useState<ExploreListItem[]>([]);
  const [popularItems, setPopularItems] = useState<ExploreListItem[]>([]);
  const [leaderboardCards, setLeaderboardCards] = useState<ExploreListItem[]>([]);
  const [leaderboardStatblocks, setLeaderboardStatblocks] = useState<ExploreListItem[]>([]);
  const [followingItems, setFollowingItems] = useState<ExploreListItem[]>([]);
  const [followingAuthed, setFollowingAuthed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFollowingLoading(true);
      try {
        const ff = await fetchFollowingFeed();
        if (cancelled) return;
        setFollowingItems(ff.items);
        setFollowingAuthed(ff.authed);
      } finally {
        if (!cancelled) setFollowingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [n, f, p, lbCard, lbSb] = await Promise.all([
          fetchSection('new'),
          fetchSection('forked'),
          fetchSection('popular'),
          fetchRatedByType('card', 8),
          fetchRatedByType('statblock', 8),
        ]);
        if (cancelled) return;
        setNewItems(n);
        setForkedItems(f);
        setPopularItems(p);
        setLeaderboardCards(lbCard);
        setLeaderboardStatblocks(lbSb);
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

        <FollowingFeedSection
          items={followingItems}
          loading={followingLoading}
          authed={followingAuthed}
        />

        <LeaderboardSection
          topCards={leaderboardCards}
          topStatblocks={leaderboardStatblocks}
          loading={loading}
        />

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
