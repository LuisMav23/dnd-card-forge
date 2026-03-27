/** Display title for a cards table row (library card or stat block). */
export function forgeItemDisplayName(row: { title: string; data: unknown }): string {
  const d = row.data;
  if (d && typeof d === 'object' && 'fields' in d) {
    const fields = (d as { fields?: Record<string, string> }).fields;
    if (fields?.name?.trim()) return fields.name.trim();
  }
  return row.title;
}

/** Short type label from saved JSON (e.g. Spell, Adversary). */
export function forgeItemKindLabel(itemType: 'card' | 'statblock', data: unknown): string {
  if (data && typeof data === 'object' && 'type' in data) {
    const t = (data as { type?: string }).type;
    if (t && typeof t === 'string' && t.trim()) {
      return t.charAt(0).toUpperCase() + t.slice(1);
    }
  }
  return itemType === 'card' ? 'Card' : 'Stat block';
}
