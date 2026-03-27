import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PatchEncounterBody } from '@/lib/encounterTypes';
import { mapEntryRow } from '@/lib/encounterApiHelpers';

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
    .select('id, user_id, title, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (encErr) {
    return NextResponse.json({ error: encErr.message }, { status: 500 });
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
    return NextResponse.json({ error: entErr.message }, { status: 500 });
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
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (encErr) {
    return NextResponse.json({ error: encErr.message }, { status: 500 });
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

  if (body.title === undefined && body.entries === undefined && body.folderId === undefined) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const updates: { title?: string; updated_at: string; folder_id?: string | null } = {
    updated_at: now,
  };

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
      return NextResponse.json({ error: delErr.message }, { status: 500 });
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
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  const { error: upErr } = await supabase.from('encounters').update(updates).eq('id', id);
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('encounters').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
