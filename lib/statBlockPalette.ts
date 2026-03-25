import type { CSSProperties } from 'react';
import type { StatBlockState } from './statblockTypes';
import { DEFAULT_CARD_PALETTE, LEGACY_THEME_BG, type CardPalette } from './cardPalette';

function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
}

/** Default palette when creating or switching stat block type (from former `defaultTheme`). */
export function paletteFromStatBlockDefaultTheme(themeKey: string): CardPalette {
  const grad = LEGACY_THEME_BG[themeKey] ?? LEGACY_THEME_BG.arcane;
  return {
    ...DEFAULT_CARD_PALETTE,
    colorBgFrom: grad.from,
    colorBgTo: grad.to,
  };
}

/** Loaded JSON: new `color*` fields, or legacy `theme` / optional `customBg*`. */
export function hydrateStatBlockPalette(raw: Record<string, unknown>): CardPalette {
  const themeKey = typeof raw.theme === 'string' ? raw.theme : 'arcane';
  const grad = LEGACY_THEME_BG[themeKey] ?? LEGACY_THEME_BG.arcane;

  return {
    colorBgFrom: isHexColor(raw.colorBgFrom)
      ? raw.colorBgFrom
      : isHexColor(raw.customBgFrom)
        ? raw.customBgFrom
        : grad.from,
    colorBgTo: isHexColor(raw.colorBgTo)
      ? raw.colorBgTo
      : isHexColor(raw.customBgTo)
        ? raw.customBgTo
        : grad.to,
    colorForeground: isHexColor(raw.colorForeground)
      ? raw.colorForeground
      : DEFAULT_CARD_PALETTE.colorForeground,
    colorAccent: isHexColor(raw.colorAccent) ? raw.colorAccent : DEFAULT_CARD_PALETTE.colorAccent,
    colorBorderOuter: isHexColor(raw.colorBorderOuter)
      ? raw.colorBorderOuter
      : DEFAULT_CARD_PALETTE.colorBorderOuter,
    colorBorderInner: isHexColor(raw.colorBorderInner)
      ? raw.colorBorderInner
      : DEFAULT_CARD_PALETTE.colorBorderInner,
  };
}

export function statBlockPaletteCssVars(state: StatBlockState): CSSProperties {
  return {
    ['--sb-bg-from' as string]: state.colorBgFrom,
    ['--sb-bg-to' as string]: state.colorBgTo,
    ['--sb-fg' as string]: state.colorForeground,
    ['--sb-accent' as string]: state.colorAccent,
    ['--sb-border-o' as string]: state.colorBorderOuter,
    ['--sb-border-i' as string]: state.colorBorderInner,
  };
}
