'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CardState } from '@/lib/types';
import { coerceRarity, hydrateCardPalette } from '@/lib/cardPalette';
import { exploreCount } from '@/lib/exploreTypes';
import { exportCardToPng } from '@/lib/exportCardPng';
import { exportStatBlockToPng } from '@/lib/exportStatBlockPng';
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
        const data = (await res.json()) as PublishedRow;
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
      setDownloadLabel('✕ Error');
      setTimeout(() => setDownloadLabel('⬇ Download PNG'), 2500);
    } finally {
      setDownloading(false);
    }
  }, [cardState, statState]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/explore"
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← Explore
          </Link>
          {status === 'ready' && row ? (
            <div className="flex flex-wrap items-end justify-end gap-2 sm:items-center">
              <div className="mr-auto hidden text-xs text-muted sm:mr-0 sm:block sm:text-right">
                <span className="text-bronze">
                  {row.published_author_name?.trim()
                    ? `By ${row.published_author_name.trim()}`
                    : 'Community'}{' '}
                </span>
                <span className="text-muted/70">
                  · {exploreCount(row.view_count)} views · {exploreCount(row.fork_count)} forks
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="panel-btn border-bdr text-parch hover:border-gold/35 hover:text-gold disabled:opacity-50"
              >
                {downloadLabel}
              </button>
              <button
                type="button"
                onClick={() => void handleFork()}
                disabled={forking}
                className="panel-btn text-gold disabled:opacity-50"
              >
                {forkLabel}
              </button>
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
