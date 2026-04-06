import { NextResponse } from 'next/server';
import { mapPublishedRowToExploreItem, type PublishedCardExploreRow } from '@/lib/exploreItemMap';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

const LIST_FIELDS =
  'id, title, item_type, user_id, published_at, view_count, fork_count, published_author_name, data, upvote_count, downvote_count, favorite_count';

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 24;
  if (Number.isNaN(n)) return 24;
  return Math.min(50, Math.max(1, n));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = clampLimit(searchParams.get('limit'));

  const { data: follows, error: fErr } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id);

  if (fErr) {
    return internalError(fErr, 'following-feed/GET/follows');
  }

  const ids = (follows ?? []).map(f => f.following_id).filter(Boolean) as string[];
  if (ids.length === 0) {
    return NextResponse.json({ items: [] as ReturnType<typeof mapPublishedRowToExploreItem>[] });
  }

  const { data: rows, error: cErr } = await supabase
    .from('cards')
    .select(LIST_FIELDS)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock'])
    .in('user_id', ids)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (cErr) {
    return internalError(cErr, 'following-feed/GET/cards');
  }

  const items = (rows ?? []).map(row =>
    mapPublishedRowToExploreItem(row as PublishedCardExploreRow)
  );

  return NextResponse.json({ items });
}
