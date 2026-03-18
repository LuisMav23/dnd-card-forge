import { Rarity, RarityOption } from './types';

export function abilityMod(score: number | string): string {
  const n = typeof score === 'string' ? parseInt(score, 10) : score;
  const s = isNaN(n) ? 10 : n;
  const m = Math.floor((s - 10) / 2);
  return (m >= 0 ? '+' : '') + m;
}

export const GEMS: Record<Rarity, string> = {
  common: '◇',
  uncommon: '◇◇◇',
  rare: '◆◆◆',
  epic: '◆◆◆◆',
  legendary: '◆◆◆◆◆',
  artifact: '◈◈◈◈◈',
};

export const RARITIES: RarityOption[] = [
  { key: 'common', color: '#aaa', border: '#888' },
  { key: 'uncommon', color: '#5acc5a', border: '#2a7a2a' },
  { key: 'rare', color: '#6080d0', border: '#1a3a9b' },
  { key: 'epic', color: '#a060d0', border: '#6a1a9b' },
  { key: 'legendary', color: '#c9a84c', border: '#c9a84c' },
  { key: 'artifact', color: '#e08080', border: '#c85858' },
];

export const CORNER_SVG = `<svg viewBox="0 0 20 20"><path d="M0 20L0 0L20 0" fill="none" stroke="rgba(20,8,0,.38)" stroke-width="2"/><circle cx="0" cy="0" r="3.5" fill="rgba(20,8,0,.22)"/></svg>`;
