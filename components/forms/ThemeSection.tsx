'use client';

import { ThemeOption, Rarity } from '@/lib/types';
import { RARITIES } from '@/lib/utils';

interface Props {
  themes: ThemeOption[];
  currentTheme: string;
  currentRarity: Rarity;
  onThemeChange: (theme: string) => void;
  onRarityChange: (rarity: Rarity) => void;
}

export default function ThemeSection({ themes, currentTheme, currentRarity, onThemeChange, onRarityChange }: Props) {
  return (
    <div className="fsec">
      <h3>🎨 Card Theme</h3>
      <div className="fg" style={{ marginBottom: 10 }}>
        <label>Background</label>
        <div className="swatches">
          {themes.map(th => (
            <div
              key={th.key}
              className={`swatch${currentTheme === th.key ? ' active' : ''}`}
              style={{ background: th.bg }}
              title={th.name}
              onClick={() => onThemeChange(th.key)}
            />
          ))}
        </div>
      </div>
      <div className="fg">
        <label>Rarity / Power Level</label>
        <div className="rar-opts">
          {RARITIES.map(r => (
            <button
              key={r.key}
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
