'use client';

import { useReducer, useRef, useCallback, useState } from 'react';
import { GameSystem, StatBlockState, StatBlockAction, StatBlockType } from '@/lib/statblockTypes';
import { STATBLOCK_TYPES, getDefaultStatBlockFields, getDefaultFeatures } from '@/lib/statblockConfig';
import Header from '@/components/Header';
import StatBlockTypeBar from '@/components/statblocks/StatBlockTypeBar';
import StatBlockFormPanel from '@/components/statblocks/StatBlockFormPanel';
import StatBlockPreview from '@/components/statblocks/StatBlockPreview';

function statBlockReducer(state: StatBlockState, action: StatBlockAction): StatBlockState {
  switch (action.type) {
    case 'SET_SYSTEM': {
      const system = action.payload;
      const sbType: StatBlockType = 'adversary';
      const cfg = STATBLOCK_TYPES[sbType];
      return {
        system,
        type: sbType,
        theme: cfg.defaultTheme,
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
        theme: cfg.defaultTheme,
        icon: cfg.defaultIcon,
        image: null,
        fields: getDefaultStatBlockFields(state.system, action.payload),
        features: getDefaultFeatures(state.system, action.payload),
      };
    }
    case 'SET_THEME':
      return { ...state, theme: action.payload };
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
        features: state.features.map(f => f.id === action.payload.id ? action.payload : f),
      };
    case 'REMOVE_FEATURE':
      return {
        ...state,
        features: state.features.filter(f => f.id !== action.payload),
      };
    default:
      return state;
  }
}

const initialState: StatBlockState = {
  system: 'daggerheart',
  type: 'adversary',
  theme: STATBLOCK_TYPES.adversary.defaultTheme,
  icon: STATBLOCK_TYPES.adversary.defaultIcon,
  image: null,
  fields: getDefaultStatBlockFields('daggerheart', 'adversary'),
  features: getDefaultFeatures('daggerheart', 'adversary'),
};

export default function StatBlocksPage() {
  const [state, dispatch] = useReducer(statBlockReducer, initialState);
  const blockRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Stat Block as PNG');

  const handleSystemChange = useCallback((system: GameSystem) => {
    dispatch({ type: 'SET_SYSTEM', payload: system });
  }, []);

  const handleTypeChange = useCallback((type: StatBlockType) => {
    dispatch({ type: 'SET_STATBLOCK_TYPE', payload: type });
  }, []);

  const handleExport = useCallback(async () => {
    const el = blockRef.current;
    if (!el) return;

    setExporting(true);
    setExportLabel('⏳ Generating…');

    const clone = el.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '700px',
      transform: 'none',
    });
    document.body.appendChild(clone);

    try {
      const html2canvas = (await import('html2canvas')).default;
      await new Promise(r => setTimeout(r, 250));

      const canvas = await html2canvas(clone, {
        width: 700,
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${(state.fields.name || 'stat-block').replace(/\s+/g, '-').toLowerCase()}-statblock.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      setExportLabel('✓ Exported!');
      setTimeout(() => { setExportLabel('⬇ Export Stat Block as PNG'); setExporting(false); }, 2200);
    } catch (err) {
      console.error(err);
      setExportLabel('✕ Error — Try Again');
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Stat Block as PNG'), 2500);
    } finally {
      document.body.removeChild(clone);
    }
  }, [state.fields.name]);

  return (
    <>
      <Header />
      <StatBlockTypeBar
        system={state.system}
        active={state.type}
        onSystemChange={handleSystemChange}
        onSelect={handleTypeChange}
      />
      <div className="workspace">
        <StatBlockFormPanel
          state={state}
          dispatch={dispatch}
          onExport={handleExport}
          exporting={exporting}
          exportLabel={exportLabel}
        />
        <StatBlockPreview ref={blockRef} state={state} />
      </div>
      <footer className="flex-shrink-0 border-t border-bdr py-2 px-4 text-center text-[.62rem] text-gold-dark italic tracking-wide font-[var(--font-cinzel),serif]">
        Created by Kurt Andrei Gabriel
      </footer>
    </>
  );
}
