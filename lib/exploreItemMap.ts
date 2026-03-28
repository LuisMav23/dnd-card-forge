import type { ExploreListItem } from '@/lib/exploreTypes';
import { thumbnailUrlFromCardData } from '@/lib/recentActivity';

/** Raw row from `cards` for published explore lists. */
export type PublishedCardExploreRow = {
  id: string;
  title: string;
  item_type: string;
  user_id: string;
  published_at: string | null;
  view_count: number | string;
  fork_count: number | string;
  published_author_name: string | null;
  data: unknown;
  upvote_count?: number | string | null;
  downvote_count?: number | string | null;
  favorite_count?: number | string | null;
};

function countField(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapPublishedRowToExploreItem(row: PublishedCardExploreRow): ExploreListItem {
  return {
    id: row.id,
    title: row.title,
    item_type: row.item_type as 'card' | 'statblock',
    published_at: row.published_at,
    view_count: row.view_count,
    fork_count: row.fork_count,
    published_author_name: row.published_author_name,
    thumbnail_url: thumbnailUrlFromCardData(row.data),
    author_id: row.user_id,
    upvote_count: countField(row.upvote_count),
    downvote_count: countField(row.downvote_count),
    favorite_count: countField(row.favorite_count),
  };
}
