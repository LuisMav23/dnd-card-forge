/** API + UI shapes for encounters (library stat block aggregates). */

import type { StatBlockState } from './statblockTypes';

export type EncounterEffectKind = 'buff' | 'debuff' | 'neutral';

export interface EncounterEffect {
  id: string;
  label: string;
  kind: EncounterEffectKind;
}

/** One creature slot in an encounter line (count slots per entry). */
export interface EncounterInstanceState {
  hp_current: number | null;
  effects: EncounterEffect[];
}

export interface EncounterSummary {
  id: string;
  title: string;
  updated_at: string;
  entry_count: number;
}

export interface EncounterEntryDetail {
  id: string;
  encounter_id: string;
  statblock_id: string | null;
  count: number;
  remaining: number;
  sort_order: number;
  /** From joined card when statblock_id present */
  statblock_title: string | null;
  /** Creature name from stat block JSON when available */
  statblock_name: string | null;
  /** Parsed from stat block `fields.hp`; UI hint when hp_current is null */
  hp_max_hint: number | null;
  /** Tracked HP for this line; mirrors instances[0] for API compat */
  hp_current: number | null;
  effects: EncounterEffect[];
  /** Parsed library stat block for full render; null if card missing */
  statblock_state: StatBlockState | null;
  /** Per-slot HP + effects; length === count */
  instances: EncounterInstanceState[];
}

export interface EncounterDetail {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  /** Supabase Storage public URL; optional cover */
  thumbnail_url: string | null;
  /** Shown on session view; editable during play */
  player_description: string | null;
  entries: EncounterEntryDetail[];
}

export interface CreateEncounterBody {
  title: string;
  entries: { statblockId: string; count: number }[];
  thumbnailUrl?: string | null;
  playerDescription?: string | null;
}

export interface PatchEncounterBody {
  title?: string;
  entries?: { statblockId: string; count: number }[];
  /** Move encounter in library; null = no folder (visible under All items only) */
  folderId?: string | null;
  thumbnailUrl?: string | null;
  /** Set or clear (empty string) player-facing notes */
  playerDescription?: string | null;
}

export interface PatchEntryRemainingBody {
  remaining: number;
}

/** PATCH /api/encounters/[id]/entries/[entryId] — at least one field required. */
export interface PatchEntrySessionBody {
  remaining?: number;
  /** Set to `null` to clear HP tracking */
  hp_current?: number | null;
  effects?: EncounterEffect[];
  /** Replace all slots; length must equal entry.count */
  instance_states?: EncounterInstanceState[];
  /** When updating hp_current/effects with count > 1, required */
  instance_index?: number;
}
