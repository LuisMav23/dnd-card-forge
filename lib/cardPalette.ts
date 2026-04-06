import type { CSSProperties } from 'react';
import type { CardFontSize, CardState, Rarity } from './types';

const CARD_FONT_SCALE: Record<CardFontSize, number> = {
  sm: 0.86,
  md: 1,
  lg: 1.14,
};

export type CardPalette = {
  colorBgFrom: string;
  colorBgTo: string;
  colorForeground: string;
  colorAccent: string;
  colorBorderOuter: string;
  colorBorderInner: string;
};

/** Default face palette (readable on light-violet gradient). */
export const DEFAULT_CARD_PALETTE: CardPalette = {
  colorBgFrom: '#e8d4f0',
  colorBgTo: '#c4a0d8',
  colorForeground: '#140800',
  colorAccent: '#917628',
  colorBorderOuter: '#c9a84c',
  colorBorderInner: '#e8c96a',
};

/** Theme key → gradient stops (cards + stat blocks + migration). */
export const LEGACY_THEME_BG: Record<string, { from: string; to: string }> = {
  arcane: { from: '#e8d4f0', to: '#c4a0d8' },
  fire: { from: '#f5d5b0', to: '#e8a870' },
  flame: { from: '#f5d5b0', to: '#e8a870' },
  infernal: { from: '#f5d5b0', to: '#e8a870' },
  nature: { from: '#c8e8c0', to: '#90c878' },
  divine: { from: '#f5f0c8', to: '#e8d870' },
  shadow: { from: '#c0b8d0', to: '#8888a8' },
  frost: { from: '#c8e0f5', to: '#90b8d8' },
  storm: { from: '#f0f0b0', to: '#d8d840' },
  blood: { from: '#f0c8c8', to: '#d88080' },
  iron: { from: '#ddd8d0', to: '#909890' },
  earth: { from: '#e0d0b0', to: '#a88848' },
  cosmic: { from: '#c0c8e8', to: '#6068a8' },
  void: { from: '#b0a8b8', to: '#504858' },
};

const LEGACY_RARITY_BORDERS: Record<Rarity, { outer: string; inner: string }> = {
  common: { outer: '#909090', inner: '#b8b8b8' },
  uncommon: { outer: '#2a7a2a', inner: '#50aa50' },
  rare: { outer: '#1a3a9b', inner: '#4060bb' },
  epic: { outer: '#6a1a9b', inner: '#9040bb' },
  legendary: { outer: '#c9a84c', inner: '#e8c96a' },
  artifact: { outer: '#c85858', inner: '#e88080' },
};

function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
}

export function coerceRarity(v: unknown): Rarity {
  const r = v as Rarity;
  if (r === 'common' || r === 'uncommon' || r === 'rare' || r === 'epic' || r === 'legendary' || r === 'artifact') {
    return r;
  }
  return 'legendary';
}

/** API-loaded or legacy JSON (theme / customBg / old saves). */
export function hydrateCardPalette(raw: Record<string, unknown>, fallbackRarity: Rarity): CardPalette {
  const rarity = coerceRarity(raw.rarity ?? fallbackRarity);
  const borders = LEGACY_RARITY_BORDERS[rarity] ?? LEGACY_RARITY_BORDERS.legendary;
  const themeKey = typeof raw.theme === 'string' ? raw.theme : 'arcane';
  const grad = LEGACY_THEME_BG[themeKey] ?? LEGACY_THEME_BG.arcane;

  const colorBgFrom = isHexColor(raw.colorBgFrom)
    ? raw.colorBgFrom
    : isHexColor(raw.customBgFrom)
      ? raw.customBgFrom
      : grad.from;
  const colorBgTo = isHexColor(raw.colorBgTo)
    ? raw.colorBgTo
    : isHexColor(raw.customBgTo)
      ? raw.customBgTo
      : grad.to;

  return {
    colorBgFrom,
    colorBgTo,
    colorForeground: isHexColor(raw.colorForeground) ? raw.colorForeground : DEFAULT_CARD_PALETTE.colorForeground,
    colorAccent: isHexColor(raw.colorAccent) ? raw.colorAccent : DEFAULT_CARD_PALETTE.colorAccent,
    colorBorderOuter: isHexColor(raw.colorBorderOuter) ? raw.colorBorderOuter : borders.outer,
    colorBorderInner: isHexColor(raw.colorBorderInner) ? raw.colorBorderInner : borders.inner,
  };
}

export function cardPaletteCssVars(state: CardState): CSSProperties {
  const fs = state.fontSize ?? 'md';
  return {
    ['--card-bg-from' as string]: state.colorBgFrom,
    ['--card-bg-to' as string]: state.colorBgTo,
    ['--card-fg' as string]: state.colorForeground,
    ['--card-accent' as string]: state.colorAccent,
    ['--card-border-o' as string]: state.colorBorderOuter,
    ['--card-border-i' as string]: state.colorBorderInner,
    ['--card-font-scale' as string]: String(CARD_FONT_SCALE[fs] ?? 1),
  };
}
