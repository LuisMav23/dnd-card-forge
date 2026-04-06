'use client';

import { MtgCardState, MtgLoyaltyAbility } from '@/lib/mtgTypes';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

const COST_PRESETS = ['+1', '+2', '+3', '0', '−1', '−2', '−3', '−4', '−5', '−6', '−7', '−8', '−9', '−10', '−12', '−14'];

export default function MtgPlaneswalkerFields({ state, onChange }: Props) {
  const abilities = state.loyaltyAbilities;

  function updateAbility(index: number, field: keyof MtgLoyaltyAbility, value: string) {
    const updated = abilities.map((ab, i) =>
      i === index ? { ...ab, [field]: value } : ab
    );
    onChange('loyaltyAbilities', updated);
  }

  function addAbility() {
    onChange('loyaltyAbilities', [...abilities, { cost: '0', text: '' }]);
  }

  function removeAbility(index: number) {
    onChange('loyaltyAbilities', abilities.filter((_, i) => i !== index));
  }

  return (
    <div className="fsec">
      <h3>Planeswalker</h3>

      {/* Starting loyalty */}
      <div className="frow c2 mb-3">
        <div className="fg">
          <label>Starting Loyalty</label>
          <input
            type="text"
            value={state.startingLoyalty}
            onChange={e => onChange('startingLoyalty', e.target.value)}
            placeholder="e.g. 4"
          />
        </div>
        <div className="fg" />
      </div>

      {/* Loyalty abilities */}
      <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-2 block">
        Loyalty Abilities
      </label>
      <div className="flex flex-col gap-3">
        {abilities.map((ab, i) => (
          <div key={i} className="rounded border border-bdr-2 bg-field-bg/30 p-3">
            <div className="mb-2 flex items-center gap-2">
              <label className="w-12 text-xs text-muted shrink-0">Cost</label>
              <select
                value={ab.cost}
                onChange={e => updateAbility(i, 'cost', e.target.value)}
                className="flex-1"
              >
                {COST_PRESETS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={ab.cost}
                onChange={e => updateAbility(i, 'cost', e.target.value)}
                placeholder="+1"
                className="w-16"
              />
              <button
                type="button"
                onClick={() => removeAbility(i)}
                className="ml-auto text-xs text-muted hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="fg">
              <label className="text-xs text-muted">Ability text</label>
              <textarea
                value={ab.text}
                onChange={e => updateAbility(i, 'text', e.target.value)}
                rows={2}
                placeholder="Ability description… Use {T} for tap, {W} etc."
              />
            </div>
          </div>
        ))}
      </div>

      {abilities.length < 5 && (
        <button
          type="button"
          onClick={addAbility}
          className="mt-3 w-full rounded border border-dashed border-bdr-2 bg-panel/40 py-2 text-xs text-muted transition-all hover:border-gold/40 hover:text-bronze"
        >
          + Add Loyalty Ability
        </button>
      )}
    </div>
  );
}
