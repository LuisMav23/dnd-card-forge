'use client';

import { MtgCardState } from '@/lib/mtgTypes';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

const QUICK_EFFECTS = [
  'Counter target spell.',
  'Destroy target creature.',
  'Destroy target permanent.',
  'Exile target creature.',
  'Deal 3 damage to any target.',
  'Deal 4 damage to target creature or planeswalker.',
  'Draw two cards.',
  'Search your library for a land card and put it into play.',
  'Each player discards their hand and draws seven cards.',
  'Take an extra turn after this one.',
];

export default function MtgInstantSorceryFields({ state, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>Quick Effects</h3>
      <p className="mb-2 text-xs text-muted">
        Click to append a common effect to your rules text.
      </p>
      <div className="flex flex-col gap-1.5">
        {QUICK_EFFECTS.map(effect => (
          <button
            key={effect}
            type="button"
            onClick={() => {
              const sep = state.rulesText ? '\n\n' : '';
              onChange('rulesText', state.rulesText + sep + effect);
            }}
            className="rounded border border-bdr-2 bg-panel/60 px-3 py-2 text-left text-xs text-bronze transition-all hover:border-gold/40 hover:text-gold"
          >
            {effect}
          </button>
        ))}
      </div>
    </div>
  );
}
