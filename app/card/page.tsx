'use client';

import { Suspense, useReducer, useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CardState, CardAction, CardType } from '@/lib/types';
import { CARD_TYPES, getDefaultFields } from '@/lib/cardConfig';
import { coerceRarity, DEFAULT_CARD_PALETTE, hydrateCardPalette } from '@/lib/cardPalette';
import { exportCardToPng } from '@/lib/exportCardPng';
import Header from '@/components/Header';
import TypeBar from '@/components/TypeBar';
import ExamplePanel from '@/components/ExamplePanel';
import FormPanel from '@/components/FormPanel';
import LivePreview from '@/components/LivePreview';
import ForgeLibraryLoadSkeleton from '@/components/ui/ForgeLibraryLoadSkeleton';
import LoadingLibraryProgressBar from '@/components/ui/LoadingLibraryProgressBar';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';

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
  ...DEFAULT_CARD_PALETTE,
  fields: getDefaultFields('spell'),
};

function CardForgeInner() {
  const searchParams = useSearchParams();
  const libraryId = searchParams.get('library');

  const [state, dispatch] = useReducer(cardReducer, initialState);
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Card as PNG');

  const [saving, setSaving] = useState(false);
  const saveBase = libraryId ? '💾 Update in Library' : '💾 Save to Library';
  const [saveLabel, setSaveLabel] = useState(saveBase);

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'ready'>(() =>
    libraryId ? 'loading' : 'ready'
  );

  useEffect(() => {
    setSaveLabel(libraryId ? '💾 Update in Library' : '💾 Save to Library');
  }, [libraryId]);

  useEffect(() => {
    if (!libraryId) {
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
    const el = cardRef.current;
    if (!el) return;

    setExporting(true);
    setExportLabel('⏳ Generating…');

    try {
      await exportCardToPng(el, state.fields.name || 'dnd-card');
      setExportLabel('✓ Exported!');
      setTimeout(() => {
        setExportLabel('⬇ Export Card as PNG');
        setExporting(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      setExportLabel('✕ Error — Try Again');
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Card as PNG'), 2500);
    }
  }, [state.fields.name]);

  const handleSave = useCallback(async () => {
    if (libraryId && loadState !== 'ready') return;
    setSaving(true);
    setSaveLabel('⏳ Saving…');
    const reset = libraryId ? '💾 Update in Library' : '💾 Save to Library';
    try {
      if (libraryId) {
        const res = await fetch(`/api/cards/${libraryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: state.fields.name || 'Untitled Card',
            cardData: state,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
        setSaveLabel('✓ Updated!');
      } else {
        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: state.fields.name || 'Untitled Card',
            itemType: 'card',
            cardData: state,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save card');
        setSaveLabel('✓ Saved!');
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Unauthorized') {
        setSaveLabel('✕ Please login first');
      } else {
        setSaveLabel('✕ Error saving');
      }
    } finally {
      setTimeout(() => {
        setSaveLabel(reset);
        setSaving(false);
      }, 2500);
    }
  }, [state, libraryId, loadState]);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden">
      <Header />
      {libraryId && (
        <div className="border-b border-bdr bg-panel/80 px-4 py-2">
          <Link
            href={`/card/${libraryId}`}
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
            onSave={handleSave}
            saving={saving}
            saveLabel={saveLabel}
            saveDisabled={Boolean(libraryId && loadState !== 'ready')}
          />
          <LivePreview ref={cardRef} state={state} />
        </div>
      )}
      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function CardForgePage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <CardForgeInner />
    </Suspense>
  );
}
