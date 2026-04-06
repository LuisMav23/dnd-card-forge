'use client';

import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_CREATURE_TYPES } from '@/lib/mtgCardConfig';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

export default function MtgCreatureFields({ state, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>Creature Stats</h3>

      {/* Power / Toughness */}
      <div className="frow c2">
        <div className="fg">
          <label>Power</label>
          <input
            type="text"
            value={state.power}
            onChange={e => onChange('power', e.target.value)}
            placeholder="e.g. 3 or *"
          />
        </div>
        <div className="fg">
          <label>Toughness</label>
          <input
            type="text"
            value={state.toughness}
            onChange={e => onChange('toughness', e.target.value)}
            placeholder="e.g. 4 or *"
          />
        </div>
      </div>

      {/* Creature type presets */}
      <div className="frow c1 mt-2">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Creature Types (quick pick)
        </label>
        <div className="max-h-[120px] overflow-y-auto rounded border border-bdr-2 bg-field-bg/30 p-2">
          <div className="flex flex-wrap gap-1">
            {MTG_CREATURE_TYPES.map(ct => (
              <button
                key={ct}
                type="button"
                onClick={() => {
                  const current = state.subtype ? state.subtype.split(' ') : [];
                  if (current.includes(ct)) {
                    onChange('subtype', current.filter(t => t !== ct).join(' '));
                  } else {
                    onChange('subtype', [...current, ct].join(' '));
                  }
                }}
                className={[
                  'rounded border px-2 py-0.5 text-[0.7rem] transition-all',
                  state.subtype?.split(' ').includes(ct)
                    ? 'border-gold bg-mid text-gold'
                    : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40 hover:text-bronze',
                ].join(' ')}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs italic text-muted">
          Or type directly in the Subtype field above.
        </p>
      </div>
    </div>
  );
}
