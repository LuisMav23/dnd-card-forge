'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CardState } from '@/lib/types';
import { coerceRarity, hydrateCardPalette } from '@/lib/cardPalette';
import { exportCardToPng } from '@/lib/exportCardPng';
import CardWikiView from '@/components/cards/CardWikiView';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';
import WikiDetailBodySkeleton from '@/components/ui/skeletons/WikiDetailBodySkeleton';

interface LibraryCardRow {
  id: string;
  title: string;
  item_type: string;
  data: CardState | string | null;
}

function parseCardStateFromRow(libraryRow: LibraryCardRow): CardState | null {
  if (libraryRow.item_type !== 'card' || libraryRow.data == null) return null;
  let loaded: CardState | string = libraryRow.data;
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

function CardDetailInner() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unauthorized'>('loading');
  const [state, setState] = useState<CardState | null>(null);
  const [savedTitle, setSavedTitle] = useState<string>('');
  const [downloadLabel, setDownloadLabel] = useState('⬇ Download card (PNG)');
  const [downloading, setDownloading] = useState(false);
  const cardExportRef = useRef<HTMLDivElement>(null);

  const handleDownloadCard = useCallback(async () => {
    const el = cardExportRef.current;
    if (!el || !state) return;
    setDownloading(true);
    setDownloadLabel('⏳ Generating…');
    try {
      await exportCardToPng(el, state.fields.name || 'dnd-card');
      setDownloadLabel('✓ Downloaded');
      setTimeout(() => setDownloadLabel('⬇ Download card (PNG)'), 2000);
    } catch (err) {
      console.error(err);
      setDownloadLabel('✕ Error — try again');
      setTimeout(() => setDownloadLabel('⬇ Download card (PNG)'), 2500);
    } finally {
      setDownloading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const res = await fetch(`/api/cards/${id}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 401) {
          setStatus('unauthorized');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const row = (await res.json()) as LibraryCardRow;
        const parsed = parseCardStateFromRow(row);
        if (!parsed) {
          setStatus('error');
          return;
        }
        setState(parsed);
        setSavedTitle(row.title || '');
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/library"
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← Library
          </Link>
          {status === 'ready' && id ? (
            <Link href={`/card?library=${id}`} className="panel-btn text-gold">
              Edit card
            </Link>
          ) : null}
        </div>
      </div>

      {status === 'loading' && (
        <div role="status" aria-label="Loading card">
          <span className="sr-only">Loading card</span>
          <WikiDetailBodySkeleton />
        </div>
      )}

      {status === 'unauthorized' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">Sign in to view this card.</p>
          <Link href="/" className="mt-4 inline-block panel-btn">
            Sign in
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">This card could not be loaded or is not a valid card.</p>
          <Link href="/library" className="mt-4 inline-block panel-btn">
            Back to library
          </Link>
        </div>
      )}

      {status === 'ready' && state && (
        <CardWikiView ref={cardExportRef} state={state} savedTitle={savedTitle} />
      )}

      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function CardDetailPage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <CardDetailInner />
    </Suspense>
  );
}
