import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PatchEncounterBody } from '@/lib/encounterTypes';
import { mapEntryRow } from '@/lib/encounterApiHelpers';
import { ownedCardAssetStoragePath } from '@/lib/storage/paths';
import { removeStorageObjectsServer } from '@/lib/storage/removeStorageObjectsServer';
import { internalError } from '@/lib/apiError';

const PLAYER_DESCRIPTION_MAX = 8000;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: enc, error: encErr } = await supabase
    .from('encounters')
    .select('id, user_id, title, created_at, updated_at, thumbnail_url, player_description')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (encErr) {
    return internalError(encErr, 'encounters/[id]/GET/enc');
  }
  if (!enc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: entryRows, error: entErr } = await supabase
    .from('encounter_entries')
    .select(
      `
      id,
      encounter_id,
      statblock_id,
      count,
      remaining,
      sort_order,
      hp_current,
      effects,
      instance_states,
      cards ( title, data )
    `
    )
    .eq('encounter_id', id)
    .order('sort_order', { ascending: true });

  if (entErr) {
    return internalError(entErr, 'encounters/[id]/GET/entries');
  }

  const entries = (entryRows ?? []).map(row =>
    mapEntryRow(
      row as Parameters<typeof mapEntryRow>[0]
    )
  );

  return NextResponse.json({
    id: enc.id,
    user_id: enc.user_id,
    title: enc.title,
    created_at: enc.created_at,
    updated_at: enc.updated_at,
    thumbnail_url: enc.thumbnail_url ?? null,
    player_description: enc.player_description ?? null,
    entries,
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: enc, error: encErr } = await supabase
    .from('encounters')
    .select('id, thumbnail_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (encErr) {
    return internalError(encErr, 'encounters/[id]/PATCH/fetch');
  }
  if (!enc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: PatchEncounterBody;
  try {
    body = (await request.json()) as PatchEncounterBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    body.title === undefined &&
    body.entries === undefined &&
    body.folderId === undefined &&
    body.thumbnailUrl === undefined &&
    body.playerDescription === undefined
  ) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const updates: {
    title?: string;
    updated_at: string;
    folder_id?: string | null;
    thumbnail_url?: string | null;
    player_description?: string | null;
  } = {
    updated_at: now,
  };

  if (body.thumbnailUrl !== undefined) {
    const prevPath = ownedCardAssetStoragePath(enc.thumbnail_url, user.id);
    let next: string | null;
    if (body.thumbnailUrl === null) {
      next = null;
    } else if (typeof body.thumbnailUrl === 'string') {
      const t = body.thumbnailUrl.trim();
      next = t.length > 0 ? t : null;
    } else {
      return NextResponse.json({ error: 'Invalid thumbnailUrl' }, { status: 400 });
    }
    updates.thumbnail_url = next;
    const nextPath = ownedCardAssetStoragePath(next, user.id);
    if (prevPath && prevPath !== nextPath) {
      await removeStorageObjectsServer([prevPath]);
    }
  }

  if (body.playerDescription !== undefined) {
    if (body.playerDescription === null) {
      updates.player_description = null;
    } else if (typeof body.playerDescription === 'string') {
      const t = body.playerDescription.trim();
      updates.player_description = t.length === 0 ? null : t.slice(0, PLAYER_DESCRIPTION_MAX);
    } else {
      return NextResponse.json({ error: 'Invalid playerDescription' }, { status: 400 });
    }
  }

  if (body.folderId !== undefined) {
    if (body.folderId === null) {
      updates.folder_id = null;
    } else if (typeof body.folderId !== 'string' || !body.folderId.trim()) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    } else {
      const { data: folderRow, error: folderErr } = await supabase
        .from('folders')
        .select('id')
        .eq('id', body.folderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (folderErr || !folderRow) {
        return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
      }
      updates.folder_id = body.folderId;
    }
  }

  if (body.title !== undefined) {
    const t = typeof body.title === 'string' ? body.title.trim() : '';
    if (!t) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }
    updates.title = t;
  }

  if (body.entries !== undefined) {
    const entries = Array.isArray(body.entries) ? body.entries : [];
    if (entries.length === 0) {
      return NextResponse.json({ error: 'At least one stat block line is required' }, { status: 400 });
    }
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e || typeof e.statblockId !== 'string' || typeof e.count !== 'number') {
        return NextResponse.json({ error: `Invalid entry at index ${i}` }, { status: 400 });
      }
      if (!Number.isInteger(e.count) || e.count < 1) {
        return NextResponse.json({ error: `Count must be a positive integer (entry ${i})` }, { status: 400 });
      }
    }
    for (const e of entries) {
      const { data: card, error: cardErr } = await supabase
        .from('cards')
        .select('id, item_type')
        .eq('id', e.statblockId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (cardErr || !card || card.item_type !== 'statblock') {
        return NextResponse.json(
          { error: `Invalid or non-stat-block library id: ${e.statblockId}` },
          { status: 400 }
        );
      }
    }

    const { error: delErr } = await supabase.from('encounter_entries').delete().eq('encounter_id', id);
    if (delErr) {
      return internalError(delErr, 'encounters/[id]/PATCH/entries-delete');
    }

    const entryRows = entries.map((e, sort_order) => ({
      encounter_id: id,
      statblock_id: e.statblockId,
      count: e.count,
      remaining: e.count,
      sort_order,
      hp_current: null,
      effects: [],
      instance_states: null,
    }));

    const { error: insErr } = await supabase.from('encounter_entries').insert(entryRows);
    if (insErr) {
      return internalError(insErr, 'encounters/[id]/PATCH/entries-insert');
    }
  }

  const { error: upErr } = await supabase.from('encounters').update(updates).eq('id', id);
  if (upErr) {
    return internalError(upErr, 'encounters/[id]/PATCH/update');
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row, error: fetchErr } = await supabase
    .from('encounters')
    .select('thumbnail_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'encounters/[id]/DELETE/fetch');
  }
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const thumbPath = ownedCardAssetStoragePath(row.thumbnail_url, user.id);

  const { error } = await supabase.from('encounters').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return internalError(error, 'encounters/[id]/DELETE');
  }

  if (thumbPath) {
    await removeStorageObjectsServer([thumbPath]);
  }

  return NextResponse.json({ ok: true });
}
