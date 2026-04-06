'use client';

import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_ENCHANTMENT_SUBTYPES } from '@/lib/mtgCardConfig';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

export default function MtgEnchantmentFields({ state, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>Enchantment Details</h3>

      <div className="frow c1">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Enchantment Subtype
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange('subtype', '')}
            className={[
              'rounded border px-2.5 py-1 text-xs transition-all',
              !state.subtype ? 'border-gold bg-mid text-gold' : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40',
            ].join(' ')}
          >
            None
          </button>
          {MTG_ENCHANTMENT_SUBTYPES.map(sub => (
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

      {state.subtype === 'Aura' && (
        <div className="frow c1 mt-3">
          <p className="rounded border border-bdr-2 bg-panel/60 px-3 py-2 text-xs text-muted">
            💡 Tip: Aura enchantments use <code className="text-gold">"Enchant [creature/player/etc.]"</code> as the first line of their rules text.
          </p>
        </div>
      )}
    </div>
  );
}
