'use client';

import { Suspense, useReducer, useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CardState, CardAction, CardType } from '@/lib/types';
import { CARD_TYPES, getDefaultFields } from '@/lib/cardConfig';
import { coerceRarity, DEFAULT_CARD_PALETTE, hydrateCardPalette } from '@/lib/cardPalette';
import { exportCardBackToPng, exportCardToPng } from '@/lib/exportCardPng';
import { getDomPngExportButtonLabel } from '@/lib/domPngExportError';
import TypeBar from '@/components/TypeBar';
import ExamplePanel from '@/components/ExamplePanel';
import FormPanel from '@/components/FormPanel';
import LivePreview, { type CardPreviewFace } from '@/components/LivePreview';
import ForgeLibraryLoadSkeleton from '@/components/ui/ForgeLibraryLoadSkeleton';
import LoadingLibraryProgressBar from '@/components/ui/LoadingLibraryProgressBar';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';
import { FROM_LIBRARY_QS, isFromLibrarySearch } from '@/lib/fromLibraryNav';
import { useLibraryItemAutosave } from '@/hooks/useLibraryItemAutosave';

function doubleRaf(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'SET_CARD_TYPE': {
      const cfg = CARD_TYPES[action.payload];
      return {
        type: action.payload,
        rarity: state.rarity,
        icon: cfg.defaultIcon,
        image: null,
        backgroundTexture: null,
        backImage: null,
        ...DEFAULT_CARD_PALETTE,
        fields: getDefaultFields(action.payload),
      };
    }
    case 'SET_RARITY':
      return { ...state, rarity: action.payload };
    case 'SET_ICON':
      return { ...state, icon: action.payload };
    case 'SET_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_BACKGROUND_TEXTURE':
      return { ...state, backgroundTexture: action.payload };
    case 'SET_BACK_IMAGE':
      return { ...state, backImage: action.payload };
    case 'SET_CARD_COLORS':
      return { ...state, ...action.payload };
    case 'SET_FIELD':
      return { ...state, fields: { ...state.fields, [action.payload.key]: action.payload.value } };
    case 'SET_FIELDS':
      return { ...state, fields: { ...state.fields, ...action.payload } };
    case 'LOAD_STATE': {
      const p = action.payload as CardState & Record<string, unknown>;
      const rarity = coerceRarity(p.rarity);
      const palette = hydrateCardPalette(p, rarity);
      return {
        type: p.type,
        rarity,
        icon: p.icon,
        image: p.image ?? null,
        backgroundTexture: p.backgroundTexture ?? null,
        backImage: p.backImage ?? null,
        fields: p.fields,
        ...palette,
      };
    }
    default:
      return state;
  }
}

const initialState: CardState = {
  type: 'spell',
  rarity: 'legendary',
  icon: '🌀',
  image: null,
  backgroundTexture: null,
  backImage: null,
  ...DEFAULT_CARD_PALETTE,
  fields: getDefaultFields('spell'),
};

const NEW_CARD_BASELINE_SERIALIZED = JSON.stringify(initialState);

function CardForgeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const libraryId = searchParams.get('library');
  const fromLibrary = isFromLibrarySearch(searchParams);
  const previewBackHref = libraryId
    ? `/card/${libraryId}${fromLibrary ? FROM_LIBRARY_QS : ''}`
    : '/card';

  const [state, dispatch] = useReducer(cardReducer, initialState);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);
  const [previewFace, setPreviewFace] = useState<CardPreviewFace>('front');
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Card as PNG');

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'ready'>(() =>
    libraryId ? 'loading' : 'ready'
  );

  const persistPost = useCallback(
    async ({ title, payload }: { title: string; payload: CardState }) => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          itemType: 'card',
          cardData: payload,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to save card');
      if (!data.id) throw new Error('Save did not return an id');
      return { id: data.id };
    },
    []
  );

  const persistPatch = useCallback(
    async ({ id, title, payload }: { id: string; title: string; payload: CardState }) => {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, cardData: payload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to update');
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
      forgeNewPath: '/card/new',
      getTitle: () => state.fields.name || 'Untitled Card',
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
        let loaded = row.data as CardState | string;
        if (typeof loaded === 'string') {
          try {
            loaded = JSON.parse(loaded) as CardState;
          } catch {
            setLoadState('error');
            return;
          }
        }
        dispatch({ type: 'LOAD_STATE', payload: loaded });
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [libraryId]);

  const handleTypeChange = useCallback((type: CardType) => {
    dispatch({ type: 'SET_CARD_TYPE', payload: type });
  }, []);

  const handleExport = useCallback(async () => {
    const frontEl = cardRef.current;
    if (!frontEl) return;

    const prevFace = previewFace;
    setExporting(true);
    setExportLabel('⏳ Generating…');

    try {
      setPreviewFace('front');
      await doubleRaf();
      await exportCardToPng(frontEl, state.fields.name || 'dnd-card');
      if (state.backImage && cardBackRef.current) {
        setPreviewFace('back');
        await doubleRaf();
        await exportCardBackToPng(cardBackRef.current, state.fields.name || 'dnd-card');
      }
      setPreviewFace(prevFace);
      setExportLabel('✓ Exported!');
      setTimeout(() => {
        setExportLabel('⬇ Export Card as PNG');
        setExporting(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      setPreviewFace(prevFace);
      setExportLabel(getDomPngExportButtonLabel(err));
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Card as PNG'), 2500);
    }
  }, [state.fields.name, state.backImage, previewFace]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {!libraryId && (
        <div className="border-b border-bdr bg-panel/80 px-4 py-2">
          <Link
            href="/card"
            className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← All cards
          </Link>
        </div>
      )}
      {libraryId && (
        <div className="border-b border-bdr bg-panel/80 px-4 py-2">
          <Link
            href={previewBackHref}
            className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← Back to preview
          </Link>
        </div>
      )}
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
          Could not load this library item. It may have been deleted or is not a card.
        </div>
      )}
      <div
        className={
          libraryId && loadState === 'loading' ? 'pointer-events-none opacity-90' : ''
        }
      >
        <TypeBar active={state.type} onSelect={handleTypeChange} typeLocked={Boolean(libraryId)} />
      </div>
      {libraryId && loadState === 'loading' ? (
        <ForgeLibraryLoadSkeleton />
      ) : (
        <div className="workspace min-h-0 flex-1">
          <ExamplePanel state={state} />
          <FormPanel
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
          <LivePreview
            state={state}
            previewFace={previewFace}
            onPreviewFaceChange={setPreviewFace}
            frontExportRef={cardRef}
            backExportRef={cardBackRef}
          />
        </div>
      )}
      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function CardForgeNewPage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <CardForgeInner />
    </Suspense>
  );
}
