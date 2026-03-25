import type { EncounterEffect, EncounterEntryDetail } from './encounterTypes';
import {
  normalizeEncounterInstances,
  parseEncounterEffects,
  parseHpMaxFromStatblockData,
} from './encounterStatHelpers';
import { parseStatBlockFromLibraryRow, type LibraryStatBlockRow } from './statBlockLoad';
import type { StatBlockState } from './statblockTypes';

type CardRow = { title: string; data: unknown } | null;

export function statblockDisplayName(card: CardRow): { title: string | null; name: string | null } {
  if (!card) return { title: null, name: null };
  let name: string | null = null;
  const raw = card.data;
  if (raw && typeof raw === 'object' && 'fields' in raw) {
    const fields = (raw as { fields?: Record<string, string> }).fields;
    if (fields?.name?.trim()) name = fields.name.trim();
  }
  return { title: card.title ?? null, name };
}

function coerceEffects(raw: unknown): EncounterEffect[] {
  const parsed = parseEncounterEffects(raw);
  return parsed ?? [];
}

function statblockStateFromCard(
  statblockId: string | null,
  card: CardRow
): StatBlockState | null {
  if (!statblockId || !card) return null;
  return parseStatBlockFromLibraryRow({
    id: statblockId,
    title: card.title,
    item_type: 'statblock',
    data: card.data as LibraryStatBlockRow['data'],
  });
}

export function mapEntryRow(
  row: {
    id: string;
    encounter_id: string;
    statblock_id: string | null;
    count: number;
    remaining: number;
    sort_order: number;
    hp_current?: number | null;
    effects?: unknown;
    instance_states?: unknown;
    cards?: CardRow | CardRow[];
  }
): EncounterEntryDetail {
  const card = Array.isArray(row.cards) ? row.cards[0] ?? null : row.cards ?? null;
  const { title, name } = statblockDisplayName(card);
  const hp_max_hint = card ? parseHpMaxFromStatblockData(card.data) : null;
  const legacyHp = row.hp_current === undefined || row.hp_current === null ? null : row.hp_current;
  const legacyFx = coerceEffects(row.effects);
  const instances = normalizeEncounterInstances(row.count, row.instance_states, legacyHp, legacyFx);
  const first = instances[0];
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    statblock_id: row.statblock_id,
    count: row.count,
    remaining: row.remaining,
    sort_order: row.sort_order,
    statblock_title: title,
    statblock_name: name,
    hp_max_hint,
    hp_current: first.hp_current,
    effects: first.effects,
    statblock_state: statblockStateFromCard(row.statblock_id, card),
    instances,
  };
}
