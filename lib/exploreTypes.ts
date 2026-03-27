export type ExploreSort = 'new' | 'forked' | 'popular';

export type ExploreListItem = {
  id: string;
  title: string;
  item_type: 'card' | 'statblock';
  published_at: string | null;
  view_count: number | string;
  fork_count: number | string;
  published_author_name: string | null;
};

export function exploreCount(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
