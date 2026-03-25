import { CardType } from './types';

export interface WikiRow {
  label: string;
  value: string;
}

const BASE_EXCLUDED = new Set([
  'name',
  'flavor',
  'desc',
  'cost',
  'class',
  'sl0',
  'sl1',
  'sl2',
  'sl3',
  'sv0',
  'sv1',
  'sv2',
  'sv3',
]);

const TYPEBAR_KEYS: Record<CardType, string[]> = {
  spell: ['sptype', 'school', 'action'],
  armor: ['atype', 'mat', 'att'],
  equipment: ['cat', 'trig', 'att'],
  weapon: ['wtype', 'dmg', 'prop'],
  sidekick: ['ctype', 'role', 'align'],
  anything: ['tl', 'tr'],
};

const SIDEKICK_ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

const KNOWN_KEY_LABELS: Record<string, string> = {
  sptype: 'Category',
  school: 'School',
  action: 'Action',
  atype: 'Armor type',
  mat: 'Material',
  att: 'Attunement',
  cat: 'Category',
  trig: 'Activation',
  wtype: 'Weapon type',
  dmg: 'Damage type',
  prop: 'Properties',
  ctype: 'Creature type',
  role: 'Role',
  align: 'Alignment',
  tl: 'Type line (left)',
  tr: 'Subtype (right)',
};

function labelForKey(key: string): string {
  if (KNOWN_KEY_LABELS[key]) return KNOWN_KEY_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Field rows not already shown in identity (type bar), cost badge, stats, or descriptions.
 */
export function getCardWikiFeatureRows(type: CardType, fields: Record<string, string>): WikiRow[] {
  const excluded = new Set<string>(BASE_EXCLUDED);
  for (const k of TYPEBAR_KEYS[type]) excluded.add(k);
  if (type === 'sidekick') {
    for (const k of SIDEKICK_ABILITIES) excluded.add(k);
  }

  const rows: WikiRow[] = [];
  for (const [key, raw] of Object.entries(fields)) {
    if (excluded.has(key)) continue;
    const value = raw?.trim();
    if (!value) continue;
    rows.push({ label: labelForKey(key), value });
  }
  rows.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  return rows;
}

/** Footer / class restriction line shown in its own subsection. */
export function getCardWikiCardExtras(fields: Record<string, string>): WikiRow | null {
  const value = fields.class?.trim();
  if (!value) return null;
  return { label: 'Source / restrictions', value };
}
