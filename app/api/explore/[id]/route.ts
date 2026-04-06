import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

const PUBLISHED_FIELDS =
  'id, title, item_type, data, published_at, view_count, fork_count, published_author_name, user_id, upvote_count, downvote_count, favorite_count, is_published';

function countField(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let data:
    | (Record<string, unknown> & { user_id: string; is_published?: boolean })
    | null = null;

  const { data: publishedRow, error: pubErr } = await supabase
    .from('cards')
    .select(PUBLISHED_FIELDS)
    .eq('id', id)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock'])
    .maybeSingle();

  if (pubErr) {
    return internalError(pubErr, 'explore/[id]/GET/published');
  }

  if (publishedRow) {
    data = publishedRow as Record<string, unknown> & { user_id: string; is_published?: boolean };
  } else if (user) {
    const { data: ownRow, error: ownErr } = await supabase
      .from('cards')
      .select(PUBLISHED_FIELDS)
      .eq('id', id)
      .eq('user_id', user.id)
      .in('item_type', ['card', 'statblock'])
      .maybeSingle();

    if (ownErr) {
      return internalError(ownErr, 'explore/[id]/GET/own');
    }
    if (ownRow) {
      data = ownRow as Record<string, unknown> & { user_id: string; is_published?: boolean };
    }
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = data as Record<string, unknown> & { user_id: string };
  const { user_id: authorId, ...rest } = row;

  let viewer_vote: -1 | 0 | 1 | null = null;
  let viewer_favorited = false;
  if (user) {
    const { data: rx } = await supabase
      .from('published_card_reactions')
      .select('vote, favorited')
      .eq('user_id', user.id)
      .eq('card_id', id)
      .maybeSingle();
    if (rx) {
      const v = rx.vote as number;
      viewer_vote = v === 1 || v === -1 || v === 0 ? v : 0;
      viewer_favorited = Boolean(rx.favorited);
    }
  }

  return NextResponse.json({
    ...rest,
    author_id: authorId,
    is_published: Boolean(row.is_published),
    upvote_count: countField(row.upvote_count),
    downvote_count: countField(row.downvote_count),
    favorite_count: countField(row.favorite_count),
    viewer_vote,
    viewer_favorited,
  });
}
