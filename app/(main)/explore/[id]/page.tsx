'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CardState } from '@/lib/types';
import { coerceRarity, hydrateCardPalette } from '@/lib/cardPalette';
import { exploreCount } from '@/lib/exploreTypes';
import { exportCardToPng } from '@/lib/exportCardPng';
import { exportStatBlockToPng } from '@/lib/exportStatBlockPng';
import { getDomPngExportButtonLabel } from '@/lib/domPngExportError';
import { parseStatBlockFromLibraryRow, type LibraryStatBlockRow } from '@/lib/statBlockLoad';
import type { StatBlockState } from '@/lib/statblockTypes';
import { createClient } from '@/lib/supabase/client';
import CardWikiView from '@/components/cards/CardWikiView';
import StatBlockWikiView from '@/components/statblocks/StatBlockWikiView';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';
import WikiDetailBodySkeleton from '@/components/ui/skeletons/WikiDetailBodySkeleton';

interface PublishedRow {
  id: string;
  title: string;
  item_type: string;
  data: unknown;
  published_at: string | null;
  view_count?: number | string;
  fork_count?: number | string;
  published_author_name: string | null;
  author_id: string;
  upvote_count: number;
  downvote_count: number;
  favorite_count: number;
  viewer_vote: -1 | 0 | 1 | null;
  viewer_favorited: boolean;
}

function parseCardStateFromRow(row: PublishedRow): CardState | null {
  if (row.item_type !== 'card' || row.data == null) return null;
  let loaded: CardState | string = row.data as CardState | string;
  if (typeof loaded === 'string') {
    try {
      loaded = JSON.parse(loaded) as CardState;
    } catch {
      return null;
    }
  }
  if (!loaded || typeof loaded !== 'object' || !('type' in loaded) || !('fields' in loaded)) {
    return null;
  }
  const raw = loaded as CardState & Record<string, unknown>;
  const rarity = coerceRarity(raw.rarity);
  const palette = hydrateCardPalette(raw, rarity);
  return {
    type: raw.type,
    rarity,
    icon: raw.icon,
    image: raw.image ?? null,
    backgroundTexture: raw.backgroundTexture ?? null,
    fields: raw.fields,
    ...palette,
  };
}

function ExplorePublishedInner() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [row, setRow] = useState<PublishedRow | null>(null);
  const [cardState, setCardState] = useState<CardState | null>(null);
  const [statState, setStatState] = useState<StatBlockState | null>(null);
  const [forkLabel, setForkLabel] = useState('Fork to my library');
  const [forking, setForking] = useState(false);
  const [downloadLabel, setDownloadLabel] = useState('⬇ Download PNG');
  const [downloading, setDownloading] = useState(false);
  const [reactionBusy, setReactionBusy] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }
    void fetch(`/api/explore/${id}/view`, { method: 'POST' }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const res = await fetch(`/api/explore/${id}`, { cache: 'no-store' });
        if (cancelled) return;
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const raw = (await res.json()) as PublishedRow & Record<string, unknown>;
        const data: PublishedRow = {
          ...raw,
          author_id: typeof raw.author_id === 'string' ? raw.author_id : '',
          upvote_count: Number(raw.upvote_count ?? 0),
          downvote_count: Number(raw.downvote_count ?? 0),
          favorite_count: Number(raw.favorite_count ?? 0),
          viewer_vote:
            raw.viewer_vote === 1 || raw.viewer_vote === -1 || raw.viewer_vote === 0
              ? raw.viewer_vote
              : raw.viewer_vote === null
                ? null
                : null,
          viewer_favorited: Boolean(raw.viewer_favorited),
        };
        if (data.item_type === 'card') {
          const parsed = parseCardStateFromRow(data);
          if (!parsed) {
            setStatus('error');
            return;
          }
          setCardState(parsed);
          setStatState(null);
        } else if (data.item_type === 'statblock') {
          const sbRow = data as unknown as LibraryStatBlockRow;
          const parsed = parseStatBlockFromLibraryRow(sbRow);
          if (!parsed) {
            setStatus('error');
            return;
          }
          setStatState(parsed);
          setCardState(null);
        } else {
          setStatus('error');
          return;
        }
        setRow(data);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const patchReaction = useCallback(
    async (patch: { vote?: -1 | 0 | 1; favorited?: boolean }) => {
      if (!id) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setReactionBusy(true);
      try {
        const res = await fetch(`/api/explore/${id}/reactions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Update failed');
        setRow(prev =>
          prev
            ? {
                ...prev,
                upvote_count: data.upvote_count ?? prev.upvote_count,
                downvote_count: data.downvote_count ?? prev.downvote_count,
                favorite_count: data.favorite_count ?? prev.favorite_count,
                viewer_vote: data.vote ?? prev.viewer_vote,
                viewer_favorited: data.favorited ?? prev.viewer_favorited,
              }
            : null
        );
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : 'Could not update');
      } finally {
        setReactionBusy(false);
      }
    },
    [id, router, supabase.auth]
  );

  const handleFork = useCallback(async () => {
    if (!id) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setForking(true);
    setForkLabel('⏳ Forking…');
    try {
      const res = await fetch(`/api/explore/${id}/fork`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Fork failed');
      const itemType = data.item_type as string;
      const newId = data.id as string;
      setForkLabel('✓ Forked!');
      if (itemType === 'statblock') {
        router.push(`/statblocks/${newId}`);
      } else {
        router.push(`/card/${newId}`);
      }
    } catch (e) {
      console.error(e);
      setForkLabel(e instanceof Error ? e.message : 'Fork failed');
      setTimeout(() => setForkLabel('Fork to my library'), 3500);
    } finally {
      setForking(false);
    }
  }, [id, router, supabase.auth]);

  const handleDownload = useCallback(async () => {
    const el = exportRef.current;
    if (!el) return;
    setDownloading(true);
    setDownloadLabel('⏳ Generating…');
    try {
      if (cardState) {
        await exportCardToPng(el, cardState.fields.name || 'dnd-card');
      } else if (statState) {
        await exportStatBlockToPng(el, statState.fields.name || 'stat-block');
      }
      setDownloadLabel('✓ Downloaded');
      setTimeout(() => setDownloadLabel('⬇ Download PNG'), 2000);
    } catch (err) {
      console.error(err);
      setDownloadLabel(getDomPngExportButtonLabel(err));
      setTimeout(() => setDownloadLabel('⬇ Download PNG'), 2500);
    } finally {
      setDownloading(false);
    }
  }, [cardState, statState]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-5">
          <Link
            href="/explore"
            className="inline-flex w-fit shrink-0 font-[var(--font-cinzel),serif] text-sm font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← Explore
          </Link>
          {status === 'ready' && row ? (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 space-y-3">
                <p className="text-base leading-relaxed text-parch">
                  <span className="text-muted">Published by </span>
                  {row.published_author_name?.trim() ? (
                    <Link
                      href={`/users/${row.author_id}`}
                      className="font-medium text-gold underline-offset-4 hover:text-gold-light hover:underline"
                    >
                      {row.published_author_name.trim()}
                    </Link>
                  ) : (
                    <span className="font-medium text-bronze">Community</span>
                  )}
                </p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-parch">
                  <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      Views
                    </span>
                    <span className="tabular-nums sm:ml-1">{exploreCount(row.view_count)}</span>
                  </li>
                  <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      Forks
                    </span>
                    <span className="tabular-nums sm:ml-1">{exploreCount(row.fork_count)}</span>
                  </li>
                  <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      Up / down
                    </span>
                    <span className="tabular-nums sm:ml-1">
                      {exploreCount(row.upvote_count)} / {exploreCount(row.downvote_count)}
                    </span>
                  </li>
                  <li className="flex flex-col gap-0.5 sm:block sm:whitespace-nowrap">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      Saves
                    </span>
                    <span className="tabular-nums sm:ml-1">{exploreCount(row.favorite_count)}</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4 border-t border-bdr/60 pt-5 lg:border-t-0 lg:pt-0">
                <div
                  role="group"
                  aria-label="Rate and save"
                  className="flex flex-wrap gap-2.5"
                >
                  <button
                    type="button"
                    disabled={reactionBusy}
                    title="Upvote"
                    onClick={() =>
                      void patchReaction({ vote: row.viewer_vote === 1 ? 0 : 1 })
                    }
                    className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                      row.viewer_vote === 1
                        ? 'border-gold/60 bg-gold/20 text-gold'
                        : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
                    }`}
                  >
                    ▲ Up
                  </button>
                  <button
                    type="button"
                    disabled={reactionBusy}
                    title="Downvote"
                    onClick={() =>
                      void patchReaction({ vote: row.viewer_vote === -1 ? 0 : -1 })
                    }
                    className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                      row.viewer_vote === -1
                        ? 'border-amber-800/60 bg-amber-950/50 text-amber-200'
                        : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
                    }`}
                  >
                    ▼ Down
                  </button>
                  <button
                    type="button"
                    disabled={reactionBusy}
                    title="Save to favorites"
                    onClick={() =>
                      void patchReaction({ favorited: !row.viewer_favorited })
                    }
                    className={`inline-flex h-11 min-w-[5.5rem] items-center justify-center rounded-lg border px-4 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                      row.viewer_favorited
                        ? 'border-pink-800/60 bg-pink-950/40 text-pink-200'
                        : 'border-bdr bg-panel/80 text-bronze hover:border-gold/35 hover:text-parch'
                    }`}
                  >
                    ♥ Save
                  </button>
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    disabled={downloading}
                    className="panel-btn min-h-11 justify-center border-bdr text-parch hover:border-gold/35 hover:text-gold disabled:opacity-50 sm:min-w-[12rem]"
                  >
                    {downloadLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFork()}
                    disabled={forking}
                    className="panel-btn min-h-11 justify-center text-gold disabled:opacity-50 sm:min-w-[14rem]"
                  >
                    {forkLabel}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {status === 'loading' && (
        <div role="status" aria-label="Loading">
          <span className="sr-only">Loading</span>
          <WikiDetailBodySkeleton />
        </div>
      )}

      {status === 'error' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">This item is not published or could not be loaded.</p>
          <Link href="/explore" className="mt-4 inline-block panel-btn">
            Back to Explore
          </Link>
        </div>
      )}

      {status === 'ready' && cardState && row && (
        <CardWikiView ref={exportRef} state={cardState} savedTitle={row.title} />
      )}

      {status === 'ready' && statState && row && (
        <StatBlockWikiView ref={exportRef} state={statState} savedTitle={row.title} />
      )}

      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function ExplorePublishedPage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <ExplorePublishedInner />
    </Suspense>
  );
}
