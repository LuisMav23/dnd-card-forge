import type { SupabaseClient } from '@supabase/supabase-js';
import { mapPublishedRowToExploreItem, type PublishedCardExploreRow } from '@/lib/exploreItemMap';
import type { ExploreListItem } from '@/lib/exploreTypes';

const LIST_FIELDS =
  'id, title, item_type, user_id, published_at, view_count, fork_count, published_author_name, data, upvote_count, downvote_count, favorite_count';

const DEFAULT_LIMIT = 8;

/**
 * Published cards/statblocks for the marketing landing spotlight (by popularity).
 */
export async function fetchLandingSpotlightItems(
  supabase: SupabaseClient,
  limit: number = DEFAULT_LIMIT
): Promise<ExploreListItem[]> {
  const { data, error } = await supabase
    .from('cards')
    .select(LIST_FIELDS)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock'])
    .order('view_count', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, limit - 1);

  if (error) {
    return [];
  }

  return (data ?? []).map(row => mapPublishedRowToExploreItem(row as PublishedCardExploreRow));
}
