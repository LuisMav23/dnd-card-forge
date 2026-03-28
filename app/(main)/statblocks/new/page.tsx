'use client';

import { Suspense, useReducer, useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameSystem, StatBlockState, StatBlockAction, StatBlockType } from '@/lib/statblockTypes';
import { STATBLOCK_TYPES, getDefaultStatBlockFields, getDefaultFeatures } from '@/lib/statblockConfig';
import { hydrateStatBlockPalette, paletteFromStatBlockDefaultTheme } from '@/lib/statBlockPalette';
import StatBlockTypeBar from '@/components/statblocks/StatBlockTypeBar';
import StatBlockFormPanel from '@/components/statblocks/StatBlockFormPanel';
import StatBlockPreview from '@/components/statblocks/StatBlockPreview';
import StatBlockLibraryLoadSkeleton from '@/components/ui/StatBlockLibraryLoadSkeleton';
import LoadingLibraryProgressBar from '@/components/ui/LoadingLibraryProgressBar';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';
import { FROM_LIBRARY_QS, isFromLibrarySearch } from '@/lib/fromLibraryNav';
import { exportStatBlockToPng } from '@/lib/exportStatBlockPng';
import { useLibraryItemAutosave } from '@/hooks/useLibraryItemAutosave';

function statBlockReducer(state: StatBlockState, action: StatBlockAction): StatBlockState {
  switch (action.type) {
    case 'SET_SYSTEM': {
      const system = action.payload;
      const sbType: StatBlockType = 'adversary';
      const cfg = STATBLOCK_TYPES[sbType];
      return {
        system,
        type: sbType,
        ...paletteFromStatBlockDefaultTheme(cfg.defaultTheme),
        icon: cfg.defaultIcon,
        image: null,
        fields: getDefaultStatBlockFields(system, sbType),
        features: getDefaultFeatures(system, sbType),
      };
    }
    case 'SET_STATBLOCK_TYPE': {
      const cfg = STATBLOCK_TYPES[action.payload];
      return {
        ...state,
        type: action.payload,
        ...paletteFromStatBlockDefaultTheme(cfg.defaultTheme),
        icon: cfg.defaultIcon,
        image: null,
        fields: getDefaultStatBlockFields(state.system, action.payload),
        features: getDefaultFeatures(state.system, action.payload),
      };
    }
    case 'SET_STATBLOCK_COLORS':
      return { ...state, ...action.payload };
    case 'SET_ICON':
      return { ...state, icon: action.payload };
    case 'SET_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_FIELD':
      return { ...state, fields: { ...state.fields, [action.payload.key]: action.payload.value } };
    case 'SET_FIELDS':
      return { ...state, fields: { ...state.fields, ...action.payload } };
    case 'ADD_FEATURE':
      return { ...state, features: [...state.features, action.payload] };
    case 'UPDATE_FEATURE':
      return {
        ...state,
        features: state.features.map(f => (f.id === action.payload.id ? action.payload : f)),
      };
    case 'REMOVE_FEATURE':
      return {
        ...state,
        features: state.features.filter(f => f.id !== action.payload),
      };
    case 'LOAD_STATE': {
      const p = action.payload as StatBlockState & Record<string, unknown>;
      const palette = hydrateStatBlockPalette(p);
      return {
        system: p.system,
        type: p.type,
        icon: p.icon,
        image: p.image ?? null,
        fields: p.fields,
        features: p.features,
        ...palette,
      };
    }
    default:
      return state;
  }
}

const initialState: StatBlockState = {
  system: 'daggerheart',
  type: 'adversary',
  ...paletteFromStatBlockDefaultTheme(STATBLOCK_TYPES.adversary.defaultTheme),
  icon: STATBLOCK_TYPES.adversary.defaultIcon,
  image: null,
  fields: getDefaultStatBlockFields('daggerheart', 'adversary'),
  features: getDefaultFeatures('daggerheart', 'adversary'),
};

const NEW_STATBLOCK_BASELINE_SERIALIZED = JSON.stringify(initialState);

function StatBlocksInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const libraryId = searchParams.get('library');
  const fromLibrary = isFromLibrarySearch(searchParams);
  const previewBackHref = libraryId
    ? `/statblocks/${libraryId}${fromLibrary ? FROM_LIBRARY_QS : ''}`
    : '/statblocks';

  const [state, dispatch] = useReducer(statBlockReducer, initialState);
  const blockRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Stat Block as PNG');

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'ready'>(() =>
    libraryId ? 'loading' : 'ready'
  );

  const persistPost = useCallback(
    async ({ title, payload }: { title: string; payload: StatBlockState }) => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          itemType: 'statblock',
          cardData: payload,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to save stat block');
      if (!data.id) throw new Error('Save did not return an id');
      return { id: data.id };
    },
    []
  );

  const persistPatch = useCallback(
    async ({ id, title, payload }: { id: string; title: string; payload: StatBlockState }) => {
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
      newItemBaselineSerialized: NEW_STATBLOCK_BASELINE_SERIALIZED,
      forgeNewPath: '/statblocks/new',
      getTitle: () => state.fields.name || 'Untitled Stat Block',
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
        if (row.item_type !== 'statblock' || !row.data) {
          setLoadState('error');
          return;
        }
        let loaded = row.data as StatBlockState | string;
        if (typeof loaded === 'string') {
          try {
            loaded = JSON.parse(loaded) as StatBlockState;
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

  const selectionLocked = Boolean(libraryId);

  const handleSystemChange = useCallback(
    (system: GameSystem) => {
      if (selectionLocked) return;
      dispatch({ type: 'SET_SYSTEM', payload: system });
    },
    [selectionLocked]
  );

  const handleTypeChange = useCallback(
    (type: StatBlockType) => {
      if (selectionLocked) return;
      dispatch({ type: 'SET_STATBLOCK_TYPE', payload: type });
    },
    [selectionLocked]
  );

  const handleExport = useCallback(async () => {
    const el = blockRef.current;
    if (!el) return;

    setExporting(true);
    setExportLabel('⏳ Generating…');

    try {
      await exportStatBlockToPng(el, state.fields.name || 'stat-block');
      setExportLabel('✓ Exported!');
      setTimeout(() => {
        setExportLabel('⬇ Export Stat Block as PNG');
        setExporting(false);
      }, 2200);
    } catch (err) {
      console.error(err);
      setExportLabel('✕ Error — Try Again');
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Stat Block as PNG'), 2500);
    }
  }, [state.fields.name]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {!libraryId && (
        <div className="border-b border-bdr bg-panel/80 px-4 py-2">
          <Link
            href="/statblocks"
            className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← All stat blocks
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
        <div className="border-b border-bdr bg-panel/90 px-4 py-2 text-center font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold">
          Loading library item…
        </div>
      )}
      {libraryId && loadState === 'error' && (
        <div className="border-b border-red-900/50 bg-red-950/40 px-4 py-2 text-center text-sm text-red-200">
          Could not load this library item. It may have been deleted or is not a stat block.
        </div>
      )}
      <div
        className={
          libraryId && loadState === 'loading' ? 'pointer-events-none opacity-90' : ''
        }
      >
        <StatBlockTypeBar
          system={state.system}
          active={state.type}
          onSystemChange={handleSystemChange}
          onSelect={handleTypeChange}
          selectionLocked={selectionLocked}
        />
      </div>
      {libraryId && loadState === 'loading' ? (
        <StatBlockLibraryLoadSkeleton />
      ) : (
        <div className="workspace min-h-0 flex-1">
          <StatBlockFormPanel
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
          <StatBlockPreview ref={blockRef} state={state} />
        </div>
      )}
      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function StatBlocksNewPage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <StatBlocksInner />
    </Suspense>
  );
}
