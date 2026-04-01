import type { Feature, GameSystem, StatBlockState, StatBlockType } from './statblockTypes';
import { hydrateStatBlockPalette } from './statBlockPalette';
import { resolveIconId } from './iconRegistry';

export interface LibraryStatBlockRow {
  id: string;
  title: string;
  item_type: string;
  data: StatBlockState | string | null;
}

function coerceGameSystem(v: unknown): GameSystem {
  return v === 'dnd' ? 'dnd' : 'daggerheart';
}

function coerceStatBlockType(v: unknown): StatBlockType {
  if (v === 'adversary' || v === 'npc' || v === 'environment') return v;
  return 'adversary';
}

function isFeatureKind(v: unknown): v is Feature['kind'] {
  return v === 'action' || v === 'passive' || v === 'reaction';
}

function coerceFeatures(raw: unknown): Feature[] {
  if (!Array.isArray(raw)) return [];
  const out: Feature[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.name !== 'string' || !isFeatureKind(o.kind)) continue;
    out.push({
      id: o.id,
      kind: o.kind,
      name: o.name,
      description: typeof o.description === 'string' ? o.description : '',
    });
  }
  return out;
}

/** Parse library API row into `StatBlockState`, or null if not a valid stat block. */
export function parseStatBlockFromLibraryRow(libraryRow: LibraryStatBlockRow): StatBlockState | null {
  if (libraryRow.item_type !== 'statblock' || libraryRow.data == null) return null;
  let loaded: StatBlockState | string = libraryRow.data;
  if (typeof loaded === 'string') {
    try {
      loaded = JSON.parse(loaded) as StatBlockState;
    } catch {
      return null;
    }
  }
  if (!loaded || typeof loaded !== 'object') return null;
  const rec = loaded as unknown as Record<string, unknown>;
  if (!rec.fields || typeof rec.fields !== 'object' || Array.isArray(rec.fields)) return null;

  const palette = hydrateStatBlockPalette(rec);
  return {
    system: coerceGameSystem(rec.system),
    type: coerceStatBlockType(rec.type),
    icon: typeof rec.icon === 'string' ? resolveIconId(rec.icon) : 'skull',
    image: typeof rec.image === 'string' ? rec.image : null,
    fields: rec.fields as Record<string, string>,
    features: coerceFeatures(rec.features),
    ...palette,
  };
}
