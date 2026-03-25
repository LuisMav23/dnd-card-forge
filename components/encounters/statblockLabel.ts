export function labelForStatblockCard(c: {
  title: string;
  data: Record<string, unknown> | null;
}): string {
  const d = c.data;
  if (d && typeof d === 'object' && 'fields' in d) {
    const fields = (d as { fields?: Record<string, string> }).fields;
    if (fields?.name?.trim()) return fields.name.trim();
  }
  return c.title;
}
