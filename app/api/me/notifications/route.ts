import { NextResponse } from 'next/server';
import type { MeNotificationItem, NotificationType } from '@/lib/meNotifications';
import { createClient } from '@/lib/supabase/server';
import { isUuidString } from '@/lib/uuidValidate';

const NOTIFICATION_TYPES = new Set<NotificationType>(['comment', 'upvote', 'downvote', 'favorite']);

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 24;
  if (Number.isNaN(n)) return 24;
  return Math.min(50, Math.max(1, n));
}

function isNotificationType(value: string): value is NotificationType {
  return NOTIFICATION_TYPES.has(value as NotificationType);
}

async function enrichActorNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: Omit<MeNotificationItem, 'actor_display_name'>[]
): Promise<MeNotificationItem[]> {
  const actorIds = [...new Set(items.map(i => i.actor_id).filter((id): id is string => Boolean(id)))];
  const nameById = new Map<string, string | null>();

  for (const aid of actorIds) {
    const { data: profRows, error } = await supabase.rpc('get_user_public_profile', { p_user_id: aid });
    if (error) {
      nameById.set(aid, null);
      continue;
    }
    const row = Array.isArray(profRows) ? profRows[0] : profRows;
    const fn = row && typeof (row as { full_name?: unknown }).full_name === 'string'
      ? (row as { full_name: string }).full_name.trim()
      : '';
    nameById.set(aid, fn || null);
  }

  return items.map(row => ({
    ...row,
    actor_display_name: row.actor_id ? (nameById.get(row.actor_id) ?? null) : null,
  }));
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
  const unreadOnly = searchParams.get('unread_only') === 'true';

  const { count: unreadCount, error: countErr } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  let q = supabase
    .from('user_notifications')
    .select('id, actor_id, card_id, type, comment_id, metadata, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    q = q.is('read_at', null);
  }

  const { data: rows, error: listErr } = await q;

  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const raw = (rows ?? []).map(r => {
    const type = typeof r.type === 'string' && isNotificationType(r.type) ? r.type : 'comment';
    return {
      id: r.id as string,
      actor_id: (r.actor_id as string | null) ?? null,
      card_id: r.card_id as string,
      type,
      comment_id: (r.comment_id as string | null) ?? null,
      metadata: (r.metadata && typeof r.metadata === 'object' ? r.metadata : {}) as Record<string, unknown>,
      read_at: (r.read_at as string | null) ?? null,
      created_at: r.created_at as string,
    };
  });

  const items = await enrichActorNames(supabase, raw);

  return NextResponse.json({
    items,
    unread_count: unreadCount ?? 0,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const readAt = new Date().toISOString();

  if ('mark_all_read' in body && (body as { mark_all_read?: unknown }).mark_all_read === true) {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read_at: readAt })
      .is('read_at', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const idsRaw = (body as { ids?: unknown }).ids;
  if (!Array.isArray(idsRaw)) {
    return NextResponse.json({ error: 'Expected ids array or mark_all_read' }, { status: 400 });
  }

  const ids = idsRaw.filter((id): id is string => typeof id === 'string' && isUuidString(id));
  if (ids.length === 0) {
    return NextResponse.json({ error: 'No valid ids' }, { status: 400 });
  }

  if (ids.length > 50) {
    return NextResponse.json({ error: 'Too many ids' }, { status: 400 });
  }

  const { error } = await supabase.from('user_notifications').update({ read_at: readAt }).in('id', ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
