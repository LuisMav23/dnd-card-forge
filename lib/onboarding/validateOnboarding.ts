import {
  ONBOARDING_VERSION,
  PRIMARY_USE_OPTIONS,
  type OnboardingPayloadV1,
  type PrimaryUseOption,
} from '@/lib/onboarding/types';

const MAX_LIST_ITEMS = 40;
const MAX_ITEM_LEN = 100;
const MAX_OTHER_LEN = 500;
const MAX_NOTES_LEN = 2000;

function isPrimaryUseOption(x: unknown): x is PrimaryUseOption {
  return typeof x === 'string' && (PRIMARY_USE_OPTIONS as readonly string[]).includes(x);
}

function sanitizeStringList(raw: unknown, field: string): string[] {
  if (!Array.isArray(raw)) {
    throw new Error(`${field} must be an array`);
  }
  if (raw.length > MAX_LIST_ITEMS) {
    throw new Error(`${field} has too many entries`);
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const t = item.trim().slice(0, MAX_ITEM_LEN);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function sanitizeNullableString(raw: unknown, maxLen: number, field: string): string | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== 'string') {
    throw new Error(`${field} must be a string`);
  }
  const t = raw.trim().slice(0, maxLen);
  return t.length > 0 ? t : null;
}

/**
 * Validates and normalizes client JSON into OnboardingPayloadV1.
 */
export function parseOnboardingPayload(body: unknown): OnboardingPayloadV1 {
  if (body === null || typeof body !== 'object') {
    throw new Error('onboarding must be an object');
  }
  const o = body as Record<string, unknown>;
  if (o.v !== ONBOARDING_VERSION) {
    throw new Error(`Unsupported onboarding version`);
  }
  return {
    v: ONBOARDING_VERSION,
    games: sanitizeStringList(o.games, 'games'),
    mediaMovies: sanitizeStringList(o.mediaMovies, 'mediaMovies'),
    mediaNovels: sanitizeStringList(o.mediaNovels, 'mediaNovels'),
    worlds: sanitizeStringList(o.worlds, 'worlds'),
    primaryUse: o.primaryUse === null || o.primaryUse === undefined
      ? null
      : isPrimaryUseOption(o.primaryUse)
        ? o.primaryUse
        : (() => {
            throw new Error('Invalid primaryUse');
          })(),
    primaryUseOther: sanitizeNullableString(o.primaryUseOther, MAX_OTHER_LEN, 'primaryUseOther'),
    notes: sanitizeNullableString(o.notes, MAX_NOTES_LEN, 'notes'),
  };
}

export function parseOnboardingCompletedAt(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (raw === null) return null;
  if (typeof raw !== 'string') {
    throw new Error('onboarding_completed_at must be an ISO string or null');
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid onboarding_completed_at');
  }
  return d.toISOString();
}
