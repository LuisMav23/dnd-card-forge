'use client';

import { Rarity, CardPalettePatch } from '@/lib/types';
import { RARITIES } from '@/lib/utils';
import ColorPalettePickers from './ColorPalettePickers';
import type { CardPalette } from '@/lib/cardPalette';

interface Props {
  currentRarity: Rarity;
  onRarityChange: (rarity: Rarity) => void;
  colors: CardPalette;
  onColorChange: (patch: CardPalettePatch) => void;
}

export default function ThemeSection({ currentRarity, onRarityChange, colors, onColorChange }: Props) {
  return (
    <div className="fsec">
      <ColorPalettePickers
        title="🎨 Card colors"
        intro="Background is a gradient (start → end). Foreground drives text; accent highlights frames and gems; borders are the outer and inner frame lines."
        colors={colors}
        onColorChange={onColorChange}
      />
      <div className="fg mt-3">
        <label>Rarity / Power Level</label>
        <div className="rar-opts">
          {RARITIES.map(r => (
            <button
              key={r.key}
              type="button"
              className={`rar-btn${currentRarity === r.key ? ' active' : ''}`}
              style={{
                color: r.color,
                borderColor: r.border,
                background: currentRarity === r.key ? `${r.border}22` : undefined,
              }}
              onClick={() => onRarityChange(r.key)}
            >
              {r.key[0].toUpperCase() + r.key.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
