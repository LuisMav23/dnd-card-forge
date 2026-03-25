import type { EncounterEffect, EncounterInstanceState } from './encounterTypes';

/** First leading integer from stat block `fields.hp` (e.g. "27", "27 (5d8+5)", "6"). */
export function parseHpMaxFromStatblockData(data: unknown): number | null {
  if (!data || typeof data !== 'object' || !('fields' in data)) return null;
  const hp = (data as { fields?: Record<string, string> }).fields?.hp;
  if (!hp || typeof hp !== 'string') return null;
  const lead = hp.trim().match(/^(\d+)/);
  return lead ? parseInt(lead[1], 10) : null;
}

const MAX_EFFECTS = 24;
const MAX_LABEL_LEN = 120;

export function parseEncounterEffects(raw: unknown): EncounterEffect[] | null {
  if (!Array.isArray(raw)) return null;
  const out: EncounterEffect[] = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    if (typeof o.id !== 'string' || o.id.length > 80) continue;
    if (typeof o.label !== 'string') continue;
    const label = o.label.trim().slice(0, MAX_LABEL_LEN);
    if (!label) continue;
    const kind =
      o.kind === 'buff' || o.kind === 'debuff' || o.kind === 'neutral' ? o.kind : 'neutral';
    out.push({ id: o.id, label, kind });
    if (out.length >= MAX_EFFECTS) break;
  }
  return out;
}

function cloneInstanceState(s: EncounterInstanceState): EncounterInstanceState {
  return { hp_current: s.hp_current, effects: s.effects.map(e => ({ ...e })) };
}

function defaultSlot(legacyHp: number | null, legacyEffects: EncounterEffect[]): EncounterInstanceState {
  return {
    hp_current: legacyHp,
    effects: legacyEffects.map(e => ({ ...e })),
  };
}

/** Parse one slot from DB or JSON body; null if invalid. */
export function parseEncounterInstanceSlot(raw: unknown): EncounterInstanceState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  let hp: number | null = null;
  if (o.hp_current === null) {
    hp = null;
  } else if (typeof o.hp_current === 'number' && Number.isInteger(o.hp_current) && o.hp_current >= 0) {
    hp = o.hp_current;
  } else {
    return null;
  }
  const effects = parseEncounterEffects(o.effects);
  if (effects === null) return null;
  return { hp_current: hp, effects };
}

/** Full array for PATCH body; null if invalid. */
export function parseEncounterInstanceStatesArray(
  raw: unknown,
  count: number
): EncounterInstanceState[] | null {
  if (!Number.isInteger(count) || count < 1) return null;
  if (!Array.isArray(raw) || raw.length !== count) return null;
  const out: EncounterInstanceState[] = [];
  for (const slot of raw) {
    const p = parseEncounterInstanceSlot(slot);
    if (!p) return null;
    out.push(p);
  }
  return out;
}

/**
 * Build count slots from instance_states column or legacy hp_current + effects (same for each slot).
 */
export function normalizeEncounterInstances(
  count: number,
  instanceStatesRaw: unknown,
  legacyHp: number | null,
  legacyEffects: EncounterEffect[]
): EncounterInstanceState[] {
  if (!Number.isInteger(count) || count < 1) {
    return [defaultSlot(legacyHp, legacyEffects)];
  }

  if (Array.isArray(instanceStatesRaw) && instanceStatesRaw.length === count) {
    const out: EncounterInstanceState[] = [];
    let ok = true;
    for (const slot of instanceStatesRaw) {
      const p = parseEncounterInstanceSlot(slot);
      if (!p) {
        ok = false;
        break;
      }
      out.push(cloneInstanceState(p));
    }
    if (ok) return out;
  }

  const base = defaultSlot(legacyHp, legacyEffects);
  return Array.from({ length: count }, () => ({
    hp_current: base.hp_current,
    effects: base.effects.map(e => ({ ...e })),
  }));
}

export function encounterInstancesToJson(instances: EncounterInstanceState[]): EncounterInstanceState[] {
  return instances.map(cloneInstanceState);
}
