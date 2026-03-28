/** Single source of truth for PNG export dimensions (card + stat block). */

export const CARD_PNG_EXPORT = {
  width: 595,
  height: 833,
  scale: 1.26,
  borderRadius: '22px',
} as const;

export const STATBLOCK_PNG_EXPORT = {
  width: 700,
  scale: 1.5,
  /** Avoid runaway memory / canvas limits on pathological DOM. */
  maxHeightPx: 16000,
  minHeightPx: 100,
} as const;
