'use client';

import type { CardPalette } from '@/lib/cardPalette';

export type ColorPalettePatch = Partial<CardPalette>;

const colorInputClass =
  'h-10 w-full cursor-pointer rounded-md border border-bdr bg-input px-1 py-1';

interface Props {
  title?: string;
  intro?: string;
  colors: CardPalette;
  onColorChange: (patch: ColorPalettePatch) => void;
}

export default function ColorPalettePickers({
  title = 'Colors',
  intro = 'Background is a gradient (start → end). Foreground drives text; accent highlights chrome; borders split outer and inner frame.',
  colors,
  onColorChange,
}: Props) {
  return (
    <>
      <h3>{title}</h3>
      {intro ? <p className="mb-3 text-xs text-muted">{intro}</p> : null}
      <div className="frow c2">
        <div className="fg">
          <label>Background (start)</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorBgFrom}
            onChange={e => onColorChange({ colorBgFrom: e.target.value })}
            aria-label="Background gradient start"
          />
        </div>
        <div className="fg">
          <label>Background (end)</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorBgTo}
            onChange={e => onColorChange({ colorBgTo: e.target.value })}
            aria-label="Background gradient end"
          />
        </div>
      </div>
      <div className="frow c2">
        <div className="fg">
          <label>Foreground</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorForeground}
            onChange={e => onColorChange({ colorForeground: e.target.value })}
            aria-label="Text and primary ink"
          />
        </div>
        <div className="fg">
          <label>Accent</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorAccent}
            onChange={e => onColorChange({ colorAccent: e.target.value })}
            aria-label="Accent highlights"
          />
        </div>
      </div>
      <div className="frow c2">
        <div className="fg">
          <label>Border (outer)</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorBorderOuter}
            onChange={e => onColorChange({ colorBorderOuter: e.target.value })}
            aria-label="Outer border"
          />
        </div>
        <div className="fg">
          <label>Border (inner)</label>
          <input
            type="color"
            className={colorInputClass}
            value={colors.colorBorderInner}
            onChange={e => onColorChange({ colorBorderInner: e.target.value })}
            aria-label="Inner border"
          />
        </div>
      </div>
    </>
  );
}
