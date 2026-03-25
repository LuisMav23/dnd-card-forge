'use client';

import { CardType } from '@/lib/types';
import { CARD_TYPE_ORDER } from '@/lib/cardConfig';

interface Props {
  active: CardType;
  onSelect: (type: CardType) => void;
  /** When true (e.g. editing a saved library card), type cannot be changed. */
  typeLocked?: boolean;
}

export default function TypeBar({ active, onSelect, typeLocked = false }: Props) {
  return (
    <div className="type-bar">
      <span>Card Type:</span>
      {typeLocked && (
        <span className="mr-1 text-[0.65rem] normal-case tracking-normal text-muted">
          (locked while editing saved card)
        </span>
      )}
      {CARD_TYPE_ORDER.map(ct => {
        const isActive = active === ct.type;
        if (typeLocked) {
          return (
            <span
              key={ct.type}
              className={`tbtn${isActive ? ' active' : ''} pointer-events-none select-none${!isActive ? ' opacity-45' : ''}`}
              title="Card type cannot be changed for a saved card"
              aria-current={isActive ? 'true' : undefined}
            >
              {ct.emoji} {ct.label}
            </span>
          );
        }
        return (
          <button key={ct.type} type="button" className={`tbtn${isActive ? ' active' : ''}`} onClick={() => onSelect(ct.type)}>
            {ct.emoji} {ct.label}
          </button>
        );
      })}
    </div>
  );
}
