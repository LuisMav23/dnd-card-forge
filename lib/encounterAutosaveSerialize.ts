import type { EncounterBuilderPayload } from '@/lib/encounterTypes';

/** Stable JSON for dirty checks and last-saved snapshots. */
export function serializeEncounterBuilderPayload(p: EncounterBuilderPayload): string {
  return JSON.stringify({
    title: p.title.trim(),
    entries: p.entries.map(e => ({ statblockId: e.statblockId, count: e.count })),
    thumbnailUrl: p.thumbnailUrl,
    playerDescription: p.playerDescription.trim(),
  });
}

export const ENCOUNTER_NEW_BASELINE_SERIALIZED = serializeEncounterBuilderPayload({
  title: '',
  entries: [],
  thumbnailUrl: null,
  playerDescription: '',
});

/** Body for POST/PATCH when valid; otherwise null (do not autosave). */
export function tryBuildEncounterPersistBody(
  p: EncounterBuilderPayload
): {
  title: string;
  entries: { statblockId: string; count: number }[];
  thumbnailUrl: string | null;
  playerDescription: string | null;
} | null {
  const title = p.title.trim();
  if (!title) {
    return null;
  }
  if (p.entries.length === 0) {
    return null;
  }
  for (const e of p.entries) {
    if (!e.statblockId) {
      return null;
    }
    if (!Number.isInteger(e.count) || e.count < 1) {
      return null;
    }
  }
  return {
    title,
    entries: p.entries.map(e => ({ statblockId: e.statblockId, count: e.count })),
    thumbnailUrl: p.thumbnailUrl,
    playerDescription: p.playerDescription.trim() ? p.playerDescription.trim() : null,
  };
}
