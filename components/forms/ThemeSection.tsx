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
  showPips: boolean;
  onShowPipsChange: (show: boolean) => void;
}

export default function ThemeSection({
  currentRarity,
  onRarityChange,
  colors,
  onColorChange,
  showPips,
  onShowPipsChange,
}: Props) {
  return (
    <div className="fsec">
      <ColorPalettePickers
        title="Card colors"
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
      <div className="fg mt-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded border border-bdr bg-mid/60 text-gold focus:outline-none focus:ring-1 focus:ring-gold-dark"
            checked={showPips}
            onChange={e => onShowPipsChange(e.target.checked)}
          />
          <span className="text-[0.75rem] font-normal normal-case tracking-normal text-parch">
            Show rarity pips on card (footer gems)
          </span>
        </label>
      </div>
    </div>
  );
}
