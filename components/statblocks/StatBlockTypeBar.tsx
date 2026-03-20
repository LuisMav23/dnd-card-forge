'use client';

import { GameSystem, StatBlockType } from '@/lib/statblockTypes';
import { SYSTEM_TYPE_ORDER } from '@/lib/statblockConfig';

interface Props {
  system: GameSystem;
  active: StatBlockType;
  onSystemChange: (system: GameSystem) => void;
  onSelect: (type: StatBlockType) => void;
}

export default function StatBlockTypeBar({ system, active, onSystemChange, onSelect }: Props) {
  const types = SYSTEM_TYPE_ORDER[system];

  return (
    <div className="type-bar sb-type-bar-split">
      <div className="sb-system-toggle">
        <span>System</span>
        <button
          className={`tbtn sys-btn${system === 'dnd' ? ' active' : ''}`}
          onClick={() => onSystemChange('dnd')}
        >
          🐉 D&D 5e
        </button>
        <button
          className={`tbtn sys-btn${system === 'daggerheart' ? ' active' : ''}`}
          onClick={() => onSystemChange('daggerheart')}
        >
          ⚔️ Daggerheart
        </button>
      </div>
      <div className="sb-type-group">
        <span>Type</span>
        {types.map(t => (
          <button
            key={t.type}
            className={`tbtn${active === t.type ? ' active' : ''}`}
            onClick={() => onSelect(t.type)}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
