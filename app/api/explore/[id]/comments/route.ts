import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUuidString } from '@/lib/uuidValidate';
import { internalError } from '@/lib/apiError';

const BODY_MIN = 1;
const BODY_MAX = 4000;

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 200;
  if (Number.isNaN(n)) return 200;
  return Math.min(500, Math.max(1, n));
}

function clampOffset(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 0;
  if (Number.isNaN(n) || n < 0) return 0;
  return n;
}

function normalizeBody(text: unknown): string | null {
  if (typeof text !== 'string') return null;
  const t = text.trim();
  if (t.length < BODY_MIN || t.length > BODY_MAX) return null;
  return t;
}

/** GET flat comment list with author fields (RPC). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = await params;
  if (!cardId || !isUuidString(cardId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = clampLimit(searchParams.get('limit'));
  const offset = clampOffset(searchParams.get('offset'));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_published_card_comments', {
    p_card_id: cardId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    return internalError(error, 'explore/comments/GET');
  }

  return NextResponse.json({ comments: data ?? [], limit, offset });
}

/** POST new comment or reply. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = await params;
  if (!cardId || !isUuidString(cardId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let bodyJson: { body?: unknown; parent_id?: unknown };
  try {
    bodyJson = (await request.json()) as { body?: unknown; parent_id?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const bodyText = normalizeBody(bodyJson.body);
  if (bodyText == null) {
    return NextResponse.json(
      { error: `Body must be ${BODY_MIN}-${BODY_MAX} characters` },
      { status: 400 }
    );
  }

  let parentId: string | null = null;
  if (bodyJson.parent_id != null && bodyJson.parent_id !== '') {
    if (typeof bodyJson.parent_id !== 'string' || !isUuidString(bodyJson.parent_id)) {
      return NextResponse.json({ error: 'Invalid parent_id' }, { status: 400 });
    }
    parentId = bodyJson.parent_id;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('published_card_comments')
    .insert({
      card_id: cardId,
      user_id: user.id,
      parent_id: parentId,
      body: bodyText,
    })
    .select('id, card_id, user_id, parent_id, body, created_at')
    .single();

  if (insertErr) {
    const msg = insertErr.message ?? '';
    if (msg.includes('comments not allowed')) {
      return NextResponse.json({ error: 'Comments are not allowed on this card.' }, { status: 400 });
    }
    if (msg.includes('card must be published')) {
      return NextResponse.json({ error: 'The card must be published to accept comments.' }, { status: 400 });
    }
    if (msg.includes('parent comment')) {
      return NextResponse.json({ error: 'The parent comment was not found.' }, { status: 400 });
    }
    return internalError(insertErr, 'explore/comments/POST');
  }

  const { data: profRows } = await supabase.rpc('get_user_public_profile', { p_user_id: user.id });
  const prof = Array.isArray(profRows) ? profRows[0] : profRows;
  const author_full_name =
    typeof prof?.full_name === 'string' && prof.full_name.trim() ? prof.full_name.trim() : '';
  const author_avatar_url = typeof prof?.avatar_url === 'string' ? prof.avatar_url : null;

  return NextResponse.json({
    comment: {
      ...inserted,
      author_full_name,
      author_avatar_url,
    },
  });
}

/** DELETE own comment (cascade removes replies via FK). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = await params;
  if (!cardId || !isUuidString(cardId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('comment_id');
  if (!commentId || !isUuidString(commentId)) {
    return NextResponse.json({ error: 'Missing or invalid comment_id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: deleted, error } = await supabase
    .from('published_card_comments')
    .delete()
    .eq('id', commentId)
    .eq('card_id', cardId)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    return internalError(error, 'explore/comments/DELETE');
  }
  if (!deleted?.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
