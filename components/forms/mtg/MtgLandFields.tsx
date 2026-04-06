'use client';

import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_LAND_SUBTYPES } from '@/lib/mtgCardConfig';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

const BASIC_LAND_ABILITIES: Record<string, { text: string; mana: string }> = {
  Plains: { text: '{T}: Add {W}.', mana: '' },
  Island: { text: '{T}: Add {U}.', mana: '' },
  Swamp: { text: '{T}: Add {B}.', mana: '' },
  Mountain: { text: '{T}: Add {R}.', mana: '' },
  Forest: { text: '{T}: Add {G}.', mana: '' },
};

export default function MtgLandFields({ state, onChange }: Props) {
  function setBasicLandType(landType: string) {
    const preset = BASIC_LAND_ABILITIES[landType];
    onChange('subtype', landType);
    onChange('isBasic', true);
    if (preset) {
      onChange('rulesText', preset.text);
    }
  }

  return (
    <div className="fsec">
      <h3>Land Details</h3>

      {/* Basic land quick pick */}
      <div className="frow c1">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Basic Land Type
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(BASIC_LAND_ABILITIES).map(lt => (
            <button
              key={lt}
              type="button"
              onClick={() => setBasicLandType(lt)}
              className={[
                'rounded border px-3 py-1.5 text-xs font-semibold transition-all font-[var(--font-cinzel),serif] uppercase tracking-wider',
                state.subtype === lt
                  ? 'border-gold bg-mid text-gold'
                  : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40',
              ].join(' ')}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>

      {/* Nonbasic land subtypes */}
      <div className="frow c1 mt-2">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Other Land Subtypes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MTG_LAND_SUBTYPES.filter(lt => !BASIC_LAND_ABILITIES[lt]).map(lt => (
            <button
              key={lt}
              type="button"
              onClick={() => onChange('subtype', lt)}
              className={[
                'rounded border px-2.5 py-1 text-xs transition-all',
                state.subtype === lt
                  ? 'border-gold bg-mid text-gold'
                  : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40',
              ].join(' ')}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
