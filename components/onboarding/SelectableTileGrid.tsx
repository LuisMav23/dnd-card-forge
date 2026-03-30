'use client';

import { useCallback, useState } from 'react';

type SelectableTileGridProps = {
  presets: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  addOwnLabel?: string;
};

export default function SelectableTileGrid({
  presets,
  selected,
  onChange,
  addOwnLabel = 'Add your own',
}: SelectableTileGridProps) {
  const [customInput, setCustomInput] = useState('');

  const toggle = useCallback(
    (label: string) => {
      const key = label.trim();
      if (!key) return;
      const lower = key.toLowerCase();
      const has = selected.some(s => s.toLowerCase() === lower);
      if (has) {
        onChange(selected.filter(s => s.toLowerCase() !== lower));
      } else {
        onChange([...selected, key]);
      }
    },
    [selected, onChange]
  );

  const addCustom = useCallback(() => {
    const t = customInput.trim();
    if (!t) return;
    const lower = t.toLowerCase();
    if (selected.some(s => s.toLowerCase() === lower)) {
      setCustomInput('');
      return;
    }
    onChange([...selected, t.slice(0, 100)]);
    setCustomInput('');
  }, [customInput, selected, onChange]);

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {presets.map(label => {
          const on = selected.some(s => s.toLowerCase() === label.toLowerCase());
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`rounded-lg border px-3 py-2.5 text-left font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider transition-colors sm:px-4 sm:text-xs ${
                on
                  ? 'border-gold-dark bg-gold/20 text-gold dark:border-gold dark:text-gold-light'
                  : 'border-bdr bg-mid/80 text-parch hover:border-gold-dark/60 hover:bg-input dark:bg-field-bg'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 border-t border-bdr/60 pt-4">
        <label className="text-center font-[var(--font-cinzel),serif] text-[0.65rem] uppercase tracking-[0.2em] text-gold-dark">
          {addOwnLabel}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={100}
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Type and press Add"
            className="min-w-0 flex-1 rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/80 dark:bg-field-bg"
          />
          <button
            type="button"
            onClick={addCustom}
            className="shrink-0 rounded-md border border-gold-dark bg-gold/15 px-4 py-2 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:bg-gold/25 dark:text-gold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
