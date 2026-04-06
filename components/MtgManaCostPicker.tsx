'use client';

import { useState } from 'react';
import { MtgSymbol, parseManaString } from '@/components/MtgSymbol';

const QUICK_SYMBOLS = [
  { sym: 'W', label: 'White' },
  { sym: 'U', label: 'Blue' },
  { sym: 'B', label: 'Black' },
  { sym: 'R', label: 'Red' },
  { sym: 'G', label: 'Green' },
  { sym: 'C', label: 'Colorless' },
];

const GENERIC_AMOUNTS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', 'X'];

const SPECIAL_SYMBOLS = [
  { sym: 'T', label: 'Tap' },
  { sym: 'Q', label: 'Untap' },
  { sym: 'S', label: 'Snow' },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

export default function MtgManaCostPicker({ value, onChange, label, placeholder }: Props) {
  const [tab, setTab] = useState<'colored' | 'generic' | 'special'>('colored');

  const symbols = parseManaString(value);

  function addSymbol(sym: string) {
    onChange(`${value}{${sym}}`);
  }

  function removeLastSymbol() {
    const lastBraceIdx = value.lastIndexOf('{');
    if (lastBraceIdx >= 0) {
      onChange(value.slice(0, lastBraceIdx));
    }
  }

  function clearAll() {
    onChange('');
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark">
          {label}
        </label>
      )}

      {/* Current cost display */}
      <div className="flex min-h-[38px] items-center gap-1.5 rounded border border-bdr-2 bg-field-bg/55 px-2.5 py-1.5">
        {symbols.length === 0 ? (
          <span className="text-xs italic text-muted">{placeholder ?? 'No mana cost'}</span>
        ) : (
          symbols.map((sym, i) => <MtgSymbol key={i} symbol={sym} size={22} />)
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(['colored', 'generic', 'special'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider font-[var(--font-cinzel),serif] rounded border transition-all',
              tab === t
                ? 'border-gold bg-mid text-gold'
                : 'border-bdr bg-panel/60 text-muted hover:border-gold/40 hover:text-bronze',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Symbol grid */}
      <div className="flex flex-wrap gap-1.5">
        {tab === 'colored' &&
          QUICK_SYMBOLS.map(({ sym, label: lbl }) => (
            <button
              key={sym}
              type="button"
              onClick={() => addSymbol(sym)}
              title={lbl}
              className="flex h-8 w-8 items-center justify-center rounded border border-bdr-2 bg-panel/60 transition-all hover:border-gold/50 hover:bg-panel active:scale-95"
            >
              <MtgSymbol symbol={sym} size={20} />
            </button>
          ))}

        {tab === 'generic' &&
          GENERIC_AMOUNTS.map(sym => (
            <button
              key={sym}
              type="button"
              onClick={() => addSymbol(sym)}
              title={sym === 'X' ? 'X generic' : `${sym} generic mana`}
              className="flex h-8 w-8 items-center justify-center rounded border border-bdr-2 bg-panel/60 transition-all hover:border-gold/50 hover:bg-panel active:scale-95"
            >
              <MtgSymbol symbol={sym} size={20} />
            </button>
          ))}

        {tab === 'special' &&
          SPECIAL_SYMBOLS.map(({ sym, label: lbl }) => (
            <button
              key={sym}
              type="button"
              onClick={() => addSymbol(sym)}
              title={lbl}
              className="flex h-8 w-8 items-center justify-center rounded border border-bdr-2 bg-panel/60 transition-all hover:border-gold/50 hover:bg-panel active:scale-95"
            >
              <MtgSymbol symbol={sym} size={20} />
            </button>
          ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={removeLastSymbol}
          disabled={symbols.length === 0}
          className="rounded border border-bdr-2 bg-panel/60 px-2.5 py-1 text-xs text-muted transition-all hover:border-gold/40 hover:text-bronze disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Remove
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={symbols.length === 0}
          className="rounded border border-bdr-2 bg-panel/60 px-2.5 py-1 text-xs text-muted transition-all hover:border-gold/40 hover:text-bronze disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/** Inline symbol insertion toolbar for use inside text area fields. */
export function MtgSymbolInsertBar({
  onInsert,
  size = 18,
}: {
  onInsert: (sym: string) => void;
  size?: number;
}) {
  const allSymbols = [
    ...QUICK_SYMBOLS.map(s => s.sym),
    'T',
    'Q',
    'X',
    '1',
    '2',
    '3',
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-t border border-bdr-2 bg-panel/80 px-2 py-1.5">
      <span className="mr-1 self-center text-[0.6rem] font-semibold uppercase tracking-wider text-gold-dark font-[var(--font-cinzel),serif]">
        Insert:
      </span>
      {allSymbols.map(sym => (
        <button
          key={sym}
          type="button"
          onClick={() => onInsert(`{${sym}}`)}
          title={`{${sym}}`}
          className="flex items-center justify-center rounded border border-bdr/50 bg-field-bg/30 p-0.5 transition-all hover:border-gold/40 hover:bg-panel active:scale-95"
          style={{ width: size + 6, height: size + 6 }}
        >
          <MtgSymbol symbol={sym} size={size} />
        </button>
      ))}
    </div>
  );
}
