export type BackgroundTextureAlign = { x: number; y: number };

export const DEFAULT_BACKGROUND_TEXTURE_ALIGN: BackgroundTextureAlign = { x: 50, y: 50 };

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, n));
}

export function clampTextureAlign(partial: { x?: number; y?: number }): BackgroundTextureAlign {
  return {
    x: clampPct(partial.x ?? DEFAULT_BACKGROUND_TEXTURE_ALIGN.x),
    y: clampPct(partial.y ?? DEFAULT_BACKGROUND_TEXTURE_ALIGN.y),
  };
}

export function hydrateBackgroundTextureAlign(raw: unknown): BackgroundTextureAlign {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_BACKGROUND_TEXTURE_ALIGN };
  const o = raw as Record<string, unknown>;
  const x = typeof o.x === 'number' ? o.x : typeof o.x === 'string' ? parseFloat(o.x) : NaN;
  const y = typeof o.y === 'number' ? o.y : typeof o.y === 'string' ? parseFloat(o.y) : NaN;
  return clampTextureAlign({ x, y });
}
