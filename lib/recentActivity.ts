import type { SupabaseClient } from '@supabase/supabase-js';

export type RecentActivityItem = {
  id: string;
  title: string;
  kind: 'card' | 'statblock' | 'encounter';
  label: string;
  href: string;
  createdAt: string;
  updatedAt: string;
  /** Main art URL from saved JSON (`image`); encounters have none. */
  thumbnailUrl: string | null;
};

type EncounterRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const FETCH_LIMIT = 30;
const RESULT_LIMIT = 20;

function cardHref(itemType: string, id: string): string {
  return itemType === 'card' ? `/card/${id}` : `/statblocks/${id}`;
}

function cardKindAndLabel(itemType: string): { kind: 'card' | 'statblock'; label: string } {
  if (itemType === 'statblock') {
    return { kind: 'statblock', label: 'Stat block' };
  }
  return { kind: 'card', label: 'Card' };
}

export type CardSummaryRow = {
  id: string;
  title: string;
  item_type: string;
  created_at: string;
  updated_at: string;
};

export type CardActivityRow = CardSummaryRow & { data: unknown };

/** Card forge and stat blocks store preview art in `data.image` (HTTPS or data URL). */
export function thumbnailUrlFromCardData(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const image = (data as Record<string, unknown>).image;
  if (typeof image !== 'string') return null;
  const t = image.trim();
  return t.length > 0 ? t : null;
}

/**
 * Recent cards including `data` for home thumbnails (avoid sending large JSON to profile API).
 */
export async function fetchCardsForHomeActivity(
  supabase: SupabaseClient,
  userId: string,
  cardLimit: number
): Promise<{ cards: CardActivityRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, title, item_type, created_at, updated_at, data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(cardLimit);

  if (error) {
    return { cards: [], error: error.message };
  }

  return { cards: (data ?? []) as CardActivityRow[], error: null };
}

/**
 * Single query for profile: recent cards (for sidebar) + same rows feed into activity merge with encounters.
 */
export async function fetchCardsForProfileAndActivity(
  supabase: SupabaseClient,
  userId: string,
  cardLimit: number
): Promise<{ cards: CardSummaryRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, title, item_type, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(cardLimit);

  if (error) {
    return { cards: [], error: error.message };
  }

  return { cards: (data ?? []) as CardSummaryRow[], error: null };
}

export function mergeCardsAndEncountersIntoActivity(
  cards: CardActivityRow[],
  encounters: EncounterRow[]
): RecentActivityItem[] {
  const items: RecentActivityItem[] = [];

  for (const row of cards) {
    const { kind, label } = cardKindAndLabel(row.item_type);
    items.push({
      id: row.id,
      title: row.title?.trim() || 'Untitled',
      kind,
      label,
      href: cardHref(row.item_type, row.id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      thumbnailUrl: thumbnailUrlFromCardData(row.data),
    });
  }

  for (const row of encounters) {
    items.push({
      id: row.id,
      title: row.title?.trim() || 'Untitled',
      kind: 'encounter',
      label: 'Encounter',
      href: `/encounters/${row.id}/edit`,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      thumbnailUrl: null,
    });
  }

  items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return items.slice(0, RESULT_LIMIT);
}

export async function fetchEncountersForActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<{ encounters: EncounterRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('encounters')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(FETCH_LIMIT);

  if (error) {
    return { encounters: [], error: error.message };
  }

  return { encounters: (data ?? []) as EncounterRow[], error: null };
}
