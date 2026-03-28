import { NextResponse } from 'next/server';
import { mapPublishedRowToExploreItem, type PublishedCardExploreRow } from '@/lib/exploreItemMap';
import { createClient } from '@/lib/supabase/server';

const LIST_FIELDS =
  'id, title, item_type, user_id, published_at, view_count, fork_count, published_author_name, data, upvote_count, downvote_count, favorite_count';

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 48;
  if (Number.isNaN(n)) return 48;
  return Math.min(100, Math.max(1, n));
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

  const { data: rx, error: rErr } = await supabase
    .from('published_card_reactions')
    .select('card_id, updated_at')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (rErr) {
    return NextResponse.json({ error: rErr.message }, { status: 500 });
  }

  const cardIds = (rx ?? []).map(r => r.card_id).filter(Boolean) as string[];
  if (cardIds.length === 0) {
    return NextResponse.json({ items: [] as ReturnType<typeof mapPublishedRowToExploreItem>[] });
  }

  const { data: rows, error: cErr } = await supabase
    .from('cards')
    .select(LIST_FIELDS)
    .eq('is_published', true)
    .in('id', cardIds);

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  const byId = new Map((rows ?? []).map(r => [r.id as string, r]));
  const ordered = cardIds.map(cid => byId.get(cid)).filter(Boolean) as PublishedCardExploreRow[];

  const items = ordered.map(row => mapPublishedRowToExploreItem(row));

  return NextResponse.json({ items });
}
