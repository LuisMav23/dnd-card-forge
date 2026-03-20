'use client';

import { useReducer, useRef, useCallback, useState } from 'react';
import { CardState, CardAction, CardType } from '@/lib/types';
import { CARD_TYPES, getDefaultFields } from '@/lib/cardConfig';
import Header from '@/components/Header';
import TypeBar from '@/components/TypeBar';
import ExamplePanel from '@/components/ExamplePanel';
import FormPanel from '@/components/FormPanel';
import LivePreview from '@/components/LivePreview';

function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'SET_CARD_TYPE': {
      const cfg = CARD_TYPES[action.payload];
      return {
        type: action.payload,
        theme: cfg.defaultTheme,
        rarity: state.rarity,
        icon: cfg.defaultIcon,
        image: null,
        fields: getDefaultFields(action.payload),
      };
    }
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_RARITY':
      return { ...state, rarity: action.payload };
    case 'SET_ICON':
      return { ...state, icon: action.payload };
    case 'SET_IMAGE':
      return { ...state, image: action.payload };
    case 'SET_FIELD':
      return { ...state, fields: { ...state.fields, [action.payload.key]: action.payload.value } };
    case 'SET_FIELDS':
      return { ...state, fields: { ...state.fields, ...action.payload } };
    default:
      return state;
  }
}

const initialState: CardState = {
  type: 'spell',
  theme: 'arcane',
  rarity: 'legendary',
  icon: '🌀',
  image: null,
  fields: getDefaultFields('spell'),
};

export default function CardForgePage() {
  const [state, dispatch] = useReducer(cardReducer, initialState);
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('⬇ Export Card as PNG');

  const handleTypeChange = useCallback((type: CardType) => {
    dispatch({ type: 'SET_CARD_TYPE', payload: type });
  }, []);

  const handleExport = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return;

    setExporting(true);
    setExportLabel('⏳ Generating…');

    const clone = el.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      width: '595px',
      height: '833px',
      transform: 'none',
      borderRadius: '22px',
    });
    document.body.appendChild(clone);

    try {
      const html2canvas = (await import('html2canvas')).default;
      await new Promise(r => setTimeout(r, 250));

      const canvas = await html2canvas(clone, {
        width: 595,
        height: 833,
        scale: 1.26,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${(state.fields.name || 'dnd-card').replace(/\s+/g, '-').toLowerCase()}-card.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      setExportLabel('✓ Exported!');
      setTimeout(() => { setExportLabel('⬇ Export Card as PNG'); setExporting(false); }, 2200);
    } catch (err) {
      console.error(err);
      setExportLabel('✕ Error — Try Again');
      setExporting(false);
      setTimeout(() => setExportLabel('⬇ Export Card as PNG'), 2500);
    } finally {
      document.body.removeChild(clone);
    }
  }, [state.fields.name]);

  return (
    <>
      <Header />
      <TypeBar active={state.type} onSelect={handleTypeChange} />
      <div className="workspace">
        <ExamplePanel state={state} />
        <FormPanel
          state={state}
          dispatch={dispatch}
          onExport={handleExport}
          exporting={exporting}
          exportLabel={exportLabel}
        />
        <LivePreview ref={cardRef} state={state} />
      </div>
      <footer className="flex-shrink-0 border-t border-bdr py-2 px-4 text-center text-[.62rem] text-gold-dark italic tracking-wide font-[var(--font-cinzel),serif]">
        Created by Kurt Andrei Gabriel
      </footer>
    </>
  );
}
