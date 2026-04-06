'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { FROM_LIBRARY_APPEND, isFromLibrarySearch } from '@/lib/fromLibraryNav';
import { CardState } from '@/lib/types';
import { MtgCardState } from '@/lib/mtgTypes';
import { coerceRarity, hydrateCardPalette } from '@/lib/cardPalette';
import { resolveIconId } from '@/lib/iconRegistry';
import { exportCardBackToPng, exportCardToPng } from '@/lib/exportCardPng';
import { getDomPngExportButtonLabel } from '@/lib/domPngExportError';
import CardWikiView from '@/components/cards/CardWikiView';
import MtgCardRenderer from '@/components/MtgCardRenderer';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';
import WikiDetailBodySkeleton from '@/components/ui/skeletons/WikiDetailBodySkeleton';

function doubleRaf(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

interface LibraryCardRow {
  id: string;
  title: string;
  item_type: string;
  data: unknown;
}

function parseCardStateFromRow(libraryRow: LibraryCardRow): CardState | null {
  if (libraryRow.item_type !== 'card' || libraryRow.data == null) return null;
  let loaded: CardState | string = libraryRow.data as CardState | string;
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
    icon: resolveIconId(raw.icon),
    image: raw.image ?? null,
    backgroundTexture: raw.backgroundTexture ?? null,
    backImage: raw.backImage ?? null,
    fields: raw.fields,
    imageAspect: raw.imageAspect ?? 'square',
    fontSize: raw.fontSize ?? 'md',
    showPips: typeof raw.showPips === 'boolean' ? raw.showPips : true,
    ...palette,
  };
}

function CardDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const fromLibrary = isFromLibrarySearch(searchParams);
  const backHref = fromLibrary ? '/library' : '/card';
  const backLabel = fromLibrary ? '← Library' : '← Card Forge';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unauthorized'>('loading');
  const [state, setState] = useState<CardState | null>(null);
  const [mtgState, setMtgState] = useState<MtgCardState | null>(null);
  const [savedTitle, setSavedTitle] = useState<string>('');
  const [downloadLabel, setDownloadLabel] = useState('Download card (PNG)');
  const [downloading, setDownloading] = useState(false);
  const cardExportRef = useRef<HTMLDivElement>(null);
  const cardBackExportRef = useRef<HTMLDivElement>(null);

  const isMtg = mtgState !== null;
  const editHref = isMtg
    ? (fromLibrary ? `/card/new?game=mtg&library=${id}${FROM_LIBRARY_APPEND}` : `/card/new?game=mtg&library=${id}`)
    : (fromLibrary ? `/card/new?library=${id}${FROM_LIBRARY_APPEND}` : `/card/new?library=${id}`);

  const handleDownloadCard = useCallback(async () => {
    const frontEl = cardExportRef.current;
    if (!frontEl) return;
    setDownloading(true);
    setDownloadLabel('Generating…');
    try {
      const name = isMtg ? (mtgState?.name || 'mtg-card') : (state?.fields.name || 'dnd-card');
      await exportCardToPng(frontEl, name);
      if (!isMtg && state?.backImage && cardBackExportRef.current) {
        await doubleRaf();
        await exportCardBackToPng(cardBackExportRef.current, name);
      }
      setDownloadLabel('Downloaded');
      setTimeout(() => setDownloadLabel('Download card (PNG)'), 2000);
    } catch (err) {
      console.error(err);
      setDownloadLabel(getDomPngExportButtonLabel(err));
      setTimeout(() => setDownloadLabel('Download card (PNG)'), 2500);
    } finally {
      setDownloading(false);
    }
  }, [state, mtgState, isMtg]);

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
        setSavedTitle(row.title || '');

        if (row.item_type !== 'card' || !row.data) {
          setStatus('error');
          return;
        }

        let loaded: unknown = row.data;
        if (typeof loaded === 'string') {
          try { loaded = JSON.parse(loaded); }
          catch { setStatus('error'); return; }
        }

        // Detect MTG card
        if (loaded && typeof loaded === 'object' && (loaded as Record<string, unknown>).cardGame === 'mtg') {
          setMtgState(loaded as MtgCardState);
          setStatus('ready');
          return;
        }

        const parsed = parseCardStateFromRow({ ...row, data: loaded as CardState | string | null });
        if (!parsed) {
          setStatus('error');
          return;
        }
        setState(parsed);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col overflow-x-hidden bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            {backLabel}
          </Link>
          {status === 'ready' && id ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void handleDownloadCard()}
                disabled={downloading}
                className="panel-btn border-bdr text-parch hover:border-gold/35 hover:text-gold disabled:opacity-50"
              >
                {downloadLabel}
              </button>
              <Link href={editHref} className="panel-btn text-gold">
                Edit card
              </Link>
            </div>
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
          <Link href="/login" className="mt-4 inline-block panel-btn">
            Sign in
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">This card could not be loaded or is not a valid card.</p>
          <Link href={backHref} className="mt-4 inline-block panel-btn">
            {fromLibrary ? 'Back to library' : 'Back to Card Forge'}
          </Link>
        </div>
      )}

      {status === 'ready' && isMtg && mtgState && (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10">
          <div className="flex items-center gap-2 self-start">
            <span className="inline-flex items-center gap-1 rounded bg-red-900/30 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-red-300 border border-red-800/40 font-[var(--font-cinzel),serif]">
              ⬡ Magic: The Gathering — {mtgState.type.charAt(0).toUpperCase() + mtgState.type.slice(1)}
            </span>
          </div>
          <h1 className="self-start font-[var(--font-cinzel),serif] text-xl font-black text-gold">
            {savedTitle || mtgState.name || 'Untitled Card'}
          </h1>
          <div className="mtg-card-scale-wrap">
            <MtgCardRenderer ref={cardExportRef} state={mtgState} />
          </div>
        </div>
      )}

      {status === 'ready' && !isMtg && state && (
        <CardWikiView
          ref={cardExportRef}
          backExportRef={cardBackExportRef}
          state={state}
          savedTitle={savedTitle}
        />
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
