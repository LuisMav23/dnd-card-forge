import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Vote = -1 | 0 | 1;

function isVote(v: unknown): v is Vote {
  return v === -1 || v === 0 || v === 1;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = await params;
  if (!cardId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { vote?: unknown; favorited?: unknown };
  try {
    body = (await request.json()) as { vote?: unknown; favorited?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.vote === undefined && body.favorited === undefined) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  if (body.vote !== undefined && !isVote(body.vote)) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 });
  }
  if (body.favorited !== undefined && typeof body.favorited !== 'boolean') {
    return NextResponse.json({ error: 'Invalid favorited' }, { status: 400 });
  }

  const { data: card, error: cardErr } = await supabase
    .from('cards')
    .select('id')
    .eq('id', cardId)
    .eq('is_published', true)
    .maybeSingle();

  if (cardErr) {
    return NextResponse.json({ error: cardErr.message }, { status: 500 });
  }
  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from('published_card_reactions')
    .select('vote, favorited')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle();

  const ev = existing?.vote as number | undefined;
  const nextVoteResolved: Vote =
    body.vote !== undefined
      ? body.vote
      : ev === 1 || ev === -1 || ev === 0
        ? (ev as Vote)
        : 0;
  const nextFavorited =
    body.favorited !== undefined ? body.favorited : Boolean(existing?.favorited);

  const now = new Date().toISOString();
  const { error: upsertErr } = await supabase.from('published_card_reactions').upsert(
    {
      user_id: user.id,
      card_id: cardId,
      vote: nextVoteResolved,
      favorited: nextFavorited,
      updated_at: now,
    },
    { onConflict: 'user_id,card_id' }
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  const { data: counts } = await supabase
    .from('cards')
    .select('upvote_count, downvote_count, favorite_count')
    .eq('id', cardId)
    .single();

  return NextResponse.json({
    vote: nextVoteResolved,
    favorited: nextFavorited,
    upvote_count: Number(counts?.upvote_count ?? 0),
    downvote_count: Number(counts?.downvote_count ?? 0),
    favorite_count: Number(counts?.favorite_count ?? 0),
  });
}
