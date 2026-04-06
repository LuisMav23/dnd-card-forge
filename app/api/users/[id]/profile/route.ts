import { NextResponse } from 'next/server';
import { mapPublishedRowToExploreItem, type PublishedCardExploreRow } from '@/lib/exploreItemMap';
import { createClient } from '@/lib/supabase/server';
import { isUuidString } from '@/lib/uuidValidate';
import { internalError } from '@/lib/apiError';

const LIST_FIELDS =
  'id, title, item_type, user_id, published_at, view_count, fork_count, published_author_name, data, upvote_count, downvote_count, favorite_count';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !isUuidString(id)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profRows, error: profErr } = await supabase.rpc('get_user_public_profile', {
    p_user_id: id,
  });

  if (profErr) {
    return internalError(profErr, 'users/profile/GET/profile');
  }

  const profileRow = Array.isArray(profRows) ? profRows[0] : profRows;
  if (!profileRow || !(profileRow as { id?: string }).id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: works, error: worksErr } = await supabase
    .from('cards')
    .select(LIST_FIELDS)
    .eq('user_id', id)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(48);

  if (worksErr) {
    return internalError(worksErr, 'users/profile/GET/works');
  }

  const { data: countRows, error: countErr } = await supabase.rpc('get_user_follow_counts', {
    p_user_id: id,
  });

  if (countErr) {
    return internalError(countErr, 'users/profile/GET/counts');
  }

  const countRow = Array.isArray(countRows) ? countRows[0] : countRows;
  const follower_count = Number((countRow as { follower_count?: number })?.follower_count ?? 0);
  const following_count = Number((countRow as { following_count?: number })?.following_count ?? 0);

  let is_following = false;
  if (user && user.id !== id) {
    const { data: edge } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .maybeSingle();
    is_following = Boolean(edge);
  }

  const published = (works ?? []).map(row =>
    mapPublishedRowToExploreItem(row as PublishedCardExploreRow)
  );

  const is_self = Boolean(user && user.id === id);
  const favorites_public = Boolean(
    (profileRow as { favorites_public?: boolean }).favorites_public
  );

  let favorites: ReturnType<typeof mapPublishedRowToExploreItem>[] = [];
  if (is_self || favorites_public) {
    const { data: favIdRows, error: favErr } = await supabase.rpc(
      'get_user_public_favorite_card_ids',
      { p_user_id: id, p_limit: 48 }
    );
    if (favErr) {
      return internalError(favErr, 'users/profile/GET/fav-ids');
    }
    const idRows = Array.isArray(favIdRows) ? favIdRows : [];
    const cardIds = idRows
      .map((r: { card_id?: string }) => r.card_id)
      .filter((cid): cid is string => Boolean(cid));
    if (cardIds.length > 0) {
      const { data: favCards, error: cardsErr } = await supabase
        .from('cards')
        .select(LIST_FIELDS)
        .eq('is_published', true)
        .in('id', cardIds);
      if (cardsErr) {
        return internalError(cardsErr, 'users/profile/GET/fav-cards');
      }
      const byId = new Map((favCards ?? []).map(r => [r.id as string, r]));
      const ordered = cardIds
        .map(cid => byId.get(cid))
        .filter(Boolean) as PublishedCardExploreRow[];
      favorites = ordered.map(row => mapPublishedRowToExploreItem(row));
    }
  }

  return NextResponse.json({
    profile: profileRow,
    published,
    favorites,
    favorites_public,
    follower_count,
    following_count,
    is_following,
    is_self,
  });
}
