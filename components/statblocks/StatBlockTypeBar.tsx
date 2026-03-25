'use client';

import { GameSystem, StatBlockType } from '@/lib/statblockTypes';
import { SYSTEM_TYPE_ORDER } from '@/lib/statblockConfig';

interface Props {
  system: GameSystem;
  active: StatBlockType;
  onSystemChange: (system: GameSystem) => void;
  onSelect: (type: StatBlockType) => void;
  /** When true (e.g. editing a saved library stat block), system and type cannot be changed. */
  selectionLocked?: boolean;
}

export default function StatBlockTypeBar({
  system,
  active,
  onSystemChange,
  onSelect,
  selectionLocked = false,
}: Props) {
  const types = SYSTEM_TYPE_ORDER[system];

  return (
    <div className="type-bar sb-type-bar-split">
      <div className="sb-system-toggle">
        <span>System</span>
        {selectionLocked && (
          <span className="text-[0.65rem] normal-case tracking-normal text-muted">
            (locked while editing saved block)
          </span>
        )}
        {selectionLocked ? (
          <>
            <span
              className={`tbtn sys-btn${system === 'dnd' ? ' active' : ''} pointer-events-none select-none${system !== 'dnd' ? ' opacity-45' : ''}`}
              title="Game system cannot be changed for a saved stat block"
              aria-current={system === 'dnd' ? 'true' : undefined}
            >
              🐉 D&D 5e
            </span>
            <span
              className={`tbtn sys-btn${system === 'daggerheart' ? ' active' : ''} pointer-events-none select-none${system !== 'daggerheart' ? ' opacity-45' : ''}`}
              title="Game system cannot be changed for a saved stat block"
              aria-current={system === 'daggerheart' ? 'true' : undefined}
            >
              ⚔️ Daggerheart
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`tbtn sys-btn${system === 'dnd' ? ' active' : ''}`}
              onClick={() => onSystemChange('dnd')}
            >
              🐉 D&D 5e
            </button>
            <button
              type="button"
              className={`tbtn sys-btn${system === 'daggerheart' ? ' active' : ''}`}
              onClick={() => onSystemChange('daggerheart')}
            >
              ⚔️ Daggerheart
            </button>
          </>
        )}
      </div>
      <div className="sb-type-group">
        <span>Type</span>
        {types.map(t => {
          const isActive = active === t.type;
          if (selectionLocked) {
            return (
              <span
                key={t.type}
                className={`tbtn${isActive ? ' active' : ''} pointer-events-none select-none${!isActive ? ' opacity-45' : ''}`}
                title="Stat block type cannot be changed for a saved block"
                aria-current={isActive ? 'true' : undefined}
              >
                {t.emoji} {t.label}
              </span>
            );
          }
          return (
            <button
              key={t.type}
              type="button"
              className={`tbtn${isActive ? ' active' : ''}`}
              onClick={() => onSelect(t.type)}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
