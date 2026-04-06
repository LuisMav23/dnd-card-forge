'use client';

import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_BATTLE_SUBTYPES } from '@/lib/mtgCardConfig';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

export default function MtgBattleFields({ state, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>Battle Details</h3>

      {/* Defense counter */}
      <div className="frow c2">
        <div className="fg">
          <label>Defense Counter</label>
          <input
            type="text"
            value={state.defense}
            onChange={e => onChange('defense', e.target.value)}
            placeholder="e.g. 6"
          />
        </div>
        <div className="fg" />
      </div>

      {/* Battle subtype */}
      <div className="frow c1 mt-3">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Battle Subtype
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MTG_BATTLE_SUBTYPES.map(sub => (
            <button
              key={sub}
              type="button"
              onClick={() => onChange('subtype', sub)}
              className={[
                'rounded border px-2.5 py-1 text-xs transition-all',
                state.subtype === sub
                  ? 'border-gold bg-mid text-gold'
                  : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40',
              ].join(' ')}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded border border-bdr-2 bg-panel/60 px-3 py-2 text-xs text-muted">
        <strong className="text-bronze">Battle cards:</strong> Opponents can attack them. When
        all defense counters are removed, the card flips and its &ldquo;Defeated —&rdquo; ability triggers.
        Use the rules text area to add the defeated ability.
      </div>
    </div>
  );
}
