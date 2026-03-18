'use client';

import { CardType } from '@/lib/types';
import { CARD_TYPE_ORDER } from '@/lib/cardConfig';

interface Props {
  active: CardType;
  onSelect: (type: CardType) => void;
}

export default function TypeBar({ active, onSelect }: Props) {
  return (
    <div className="type-bar">
      <span>Card Type:</span>
      {CARD_TYPE_ORDER.map(ct => (
        <button
          key={ct.type}
          className={`tbtn${active === ct.type ? ' active' : ''}`}
          onClick={() => onSelect(ct.type)}
        >
          {ct.emoji} {ct.label}
        </button>
      ))}
    </div>
  );
}
