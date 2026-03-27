const CREATED_EDITED_THRESHOLD_MS = 60_000;

/**
 * Whether the row should read "Created … ago" vs "Edited … ago".
 */
export function isRecentlyCreated(createdAtIso: string, updatedAtIso: string): boolean {
  const created = Date.parse(createdAtIso);
  const updated = Date.parse(updatedAtIso);
  if (Number.isNaN(created) || Number.isNaN(updated)) {
    return false;
  }
  return Math.abs(updated - created) <= CREATED_EDITED_THRESHOLD_MS;
}

/**
 * Human-readable relative time, e.g. "5 minutes ago", "3 days ago".
 */
export function formatRelativeTimePast(isoDate: string, locale?: string): string {
  const then = Date.parse(isoDate);
  if (Number.isNaN(then)) {
    return '';
  }
  const now = Date.now();
  let duration = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  for (let i = 0; i < divisions.length; i++) {
    if (Math.abs(duration) < divisions[i].amount) {
      return rtf.format(Math.trunc(duration), divisions[i].unit);
    }
    duration /= divisions[i].amount;
  }

  return rtf.format(Math.trunc(duration), 'year');
}

export function formatActivityPhrase(
  createdAtIso: string,
  updatedAtIso: string,
  locale?: string
): string {
  const rel = formatRelativeTimePast(updatedAtIso, locale);
  if (!rel) {
    return '';
  }
  const prefix = isRecentlyCreated(createdAtIso, updatedAtIso) ? 'Created' : 'Edited';
  return `${prefix} ${rel}`;
}
