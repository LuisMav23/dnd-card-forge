'use client';

import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_ARTIFACT_SUBTYPES } from '@/lib/mtgCardConfig';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

const EQUIPMENT_ABILITIES = [
  'Equipped creature gets +2/+0.',
  'Equipped creature gets +0/+2.',
  'Equipped creature gets +1/+1 and has first strike.',
  'Equipped creature gets +2/+2 and has trample.',
  'Equipped creature has flying.',
  'Equipped creature has lifelink.',
  'Equipped creature has hexproof.',
  'Equip {2}',
  'Equip {3}',
  'Equip {1}',
];

export default function MtgArtifactFields({ state, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>Artifact Details</h3>

      <div className="frow c1">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Artifact Subtype
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
          {MTG_ARTIFACT_SUBTYPES.map(sub => (
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

      {state.subtype === 'Equipment' && (
        <div className="frow c1 mt-3">
          <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
            Quick Equipment Abilities
          </label>
          <div className="flex flex-col gap-1">
            {EQUIPMENT_ABILITIES.map(ab => (
              <button
                key={ab}
                type="button"
                onClick={() => {
                  const sep = state.rulesText ? '\n' : '';
                  onChange('rulesText', state.rulesText + sep + ab);
                }}
                className="rounded border border-bdr-2 bg-panel/60 px-3 py-1.5 text-left text-xs text-bronze transition-all hover:border-gold/40 hover:text-gold"
              >
                {ab}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
