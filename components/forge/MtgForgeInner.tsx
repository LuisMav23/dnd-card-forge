'use client';

import { useReducer, useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkle } from 'lucide-react';
import type { CardFontSize, ImageAspect } from '@/lib/types';
import { MtgCardState, MtgCardAction, MtgCardType } from '@/lib/mtgTypes';
import { getDefaultMtgState, hydrateMtgCardState } from '@/lib/mtgCardConfig';
import { exportCardToPng } from '@/lib/exportCardPng';
import { getDomPngExportButtonLabel } from '@/lib/domPngExportError';
import { FROM_LIBRARY_QS, isFromLibrarySearch } from '@/lib/fromLibraryNav';
import { useLibraryItemAutosave } from '@/hooks/useLibraryItemAutosave';
import MtgCardRenderer from '@/components/MtgCardRenderer';
import MtgFormPanel from '@/components/forms/mtg/MtgFormPanel';
import LoadingLibraryProgressBar from '@/components/ui/LoadingLibraryProgressBar';
import ForgeLibraryLoadSkeleton from '@/components/ui/ForgeLibraryLoadSkeleton';

function doubleRaf(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function mtgCardReducer(state: MtgCardState, action: MtgCardAction): MtgCardState {
  switch (action.type) {
    case 'SET_MTG_CARD_TYPE': {
      return getDefaultMtgState(action.payload);
    }
    case 'SET_MTG_NAME':
      return { ...state, name: action.payload };
    case 'SET_MTG_MANA_COST':
      return { ...state, manaCost: action.payload };
    case 'SET_MTG_FRAME_COLOR':
      return { ...state, frameColor: action.payload };
    case 'SET_MTG_COLORS':
      return { ...state, colors: action.payload };
    case 'SET_MTG_RARITY':
      return { ...state, rarity: action.payload };
    case 'SET_MTG_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_MTG_KEYWORDS':
      return { ...state, keywords: action.payload };
    case 'SET_MTG_LOYALTY_ABILITIES':
      return { ...state, loyaltyAbilities: action.payload };
    case 'SET_MTG_SAGA_CHAPTERS':
      return { ...state, sagaChapters: action.payload };
    case 'SET_MTG_FIELD':
      return { ...state, [action.payload.key]: action.payload.value };
    case 'LOAD_MTG_STATE':
      return action.payload;
    default:
      return state;
  }
}

export default function MtgForgeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const libraryId = searchParams.get('library');
  const fromLibrary = isFromLibrarySearch(searchParams);
  const typeParam = (searchParams.get('type') as MtgCardType | null) ?? 'creature';
  const aspectParam = (searchParams.get('aspect') as ImageAspect | null) ?? 'square';
  const fontSizeParam = (searchParams.get('fontSize') as CardFontSize | null) ?? 'md';

  const previewBackHref = libraryId
    ? `/card/${libraryId}${fromLibrary ? FROM_LIBRARY_QS : ''}`
    : '/card';

  const resolvedInitial: MtgCardState = {
    ...getDefaultMtgState(typeParam),
    imageAspect: aspectParam,
    fontSize: fontSizeParam,
  };
  const NEW_CARD_BASELINE_SERIALIZED = JSON.stringify(resolvedInitial);

  const [state, dispatch] = useReducer(mtgCardReducer, resolvedInitial);
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Card as PNG');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'ready'>(() =>
    libraryId ? 'loading' : 'ready'
  );

  const persistPost = useCallback(
    async ({ title, payload }: { title: string; payload: MtgCardState }) => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, itemType: 'card', cardData: payload }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to save card');
      if (!data.id) throw new Error('Save did not return an id');
      return { id: data.id };
    },
    []
  );

  const persistPatch = useCallback(
    async ({ id, title, payload }: { id: string; title: string; payload: MtgCardState }) => {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, cardData: payload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to update');
    },
    []
  );

  const { skipLibraryFetchIdRef, persistManual, saving, saveLabel, autosaveHint } =
    useLibraryItemAutosave({
      state,
      libraryIdFromUrl: libraryId,
      loadState,
      fromLibrary,
      router,
      newItemBaselineSerialized: NEW_CARD_BASELINE_SERIALIZED,
      forgeNewPath: '/card/new?game=mtg',
      getTitle: () => state.name || 'Untitled MTG Card',
      persistPost,
      persistPatch,
    });

  useEffect(() => {
    if (!libraryId) {
      setLoadState('ready');
      return;
    }
    if (skipLibraryFetchIdRef.current === libraryId) {
      skipLibraryFetchIdRef.current = null;
      setLoadState('ready');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    (async () => {
      try {
        const res = await fetch(`/api/cards/${libraryId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('load failed');
        const row = await res.json();
        if (cancelled) return;
        if (row.item_type !== 'card' || !row.data) {
          setLoadState('error');
          return;
        }
        let loaded = row.data as MtgCardState | string;
        if (typeof loaded === 'string') {
          try { loaded = JSON.parse(loaded) as MtgCardState; }
          catch { setLoadState('error'); return; }
        }
        if ((loaded as MtgCardState).cardGame !== 'mtg') {
          setLoadState('error');
          return;
        }
        dispatch({ type: 'LOAD_MTG_STATE', payload: hydrateMtgCardState(loaded) });
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [libraryId]);

  const handleExport = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return;
    setExporting(true);
    setExportLabel('⏳ Generating…');
    try {
      await doubleRaf();
      await exportCardToPng(el, state.name || 'mtg-card');
      setExportLabel('✓ Exported!');
      setTimeout(() => {
        setExportLabel('⬇ Export Card as PNG');
        setExporting(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      setExportLabel(getDomPngExportButtonLabel(err));
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Card as PNG'), 2500);
    }
  }, [state.name]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Back navigation */}
      <div className="border-b border-bdr bg-panel/80 px-4 py-2 flex items-center gap-3">
        <Link
          href={libraryId ? previewBackHref : '/card/new?game=mtg'}
          className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
        >
          ← {libraryId ? 'Back to preview' : 'Card types'}
        </Link>
        <span className="inline-flex items-center gap-1 rounded bg-red-900/30 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-red-300 border border-red-800/40 font-[var(--font-cinzel),serif]">
          ⬡ MTG — {state.type.charAt(0).toUpperCase() + state.type.slice(1)}
        </span>
      </div>

      {libraryId && loadState === 'loading' && (
        <div className="border-b border-bdr bg-panel/90">
          <LoadingLibraryProgressBar />
          <p className="px-4 py-1.5 text-center font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold">
            Loading library item…
          </p>
        </div>
      )}
      {libraryId && loadState === 'error' && (
        <div className="border-b border-red-900/50 bg-red-950/40 px-4 py-2 text-center text-sm text-red-200">
          Could not load this library item.
        </div>
      )}

      {loadState === 'loading' ? (
        <ForgeLibraryLoadSkeleton />
      ) : (
        <div className="workspace min-h-0 flex-1">
          {/* Form panel */}
          <MtgFormPanel
            state={state}
            dispatch={dispatch}
            onExport={handleExport}
            exporting={exporting}
            exportLabel={exportLabel}
            onSave={persistManual}
            saving={saving}
            saveLabel={saveLabel}
            saveDisabled={Boolean(libraryId && loadState !== 'ready')}
            autosaveHint={autosaveHint}
          />

          {/* Live preview panel */}
          <div className="prev-panel">
            <span className="prev-label">
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Live Preview{' '}
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
            </span>
            <div className="mtg-card-scale-wrap relative flex w-full justify-center">
              <MtgCardRenderer ref={cardRef} state={state} />
            </div>
            <p className="prev-note mt-2 max-w-[240px] text-center">
              Updates live as you edit fields
            </p>
          </div>
        </div>
      )}

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
