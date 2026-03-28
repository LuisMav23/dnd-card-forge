import { NextResponse } from 'next/server';
import { ensureLibrarySystemFolders } from '@/lib/ensureLibrarySystemFolders';
import { createClient } from '@/lib/supabase/server';
import type { CreateEncounterBody } from '@/lib/encounterTypes';

const PLAYER_DESCRIPTION_MAX = 8000;
const THUMBNAIL_URL_MAX = 2048;

function parseOptionalThumbnailUrl(raw: unknown): { ok: true; value: string | null } | { ok: false } {
  if (raw === undefined) return { ok: true, value: null };
  if (raw === null) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  const t = raw.trim();
  return { ok: true, value: t ? t.slice(0, THUMBNAIL_URL_MAX) : null };
}

function parseOptionalPlayerDescription(raw: unknown): { ok: true; value: string | null } | { ok: false } {
  if (raw === undefined) return { ok: true, value: null };
  if (raw === null) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  const t = raw.trim();
  return { ok: true, value: t ? t.slice(0, PLAYER_DESCRIPTION_MAX) : null };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from('encounters')
    .select('id, title, updated_at, folder_id, encounter_entries ( id )')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = (rows ?? []).map(r => ({
    id: r.id,
    title: r.title,
    updated_at: r.updated_at,
    folder_id: r.folder_id ?? null,
    entry_count: Array.isArray(r.encounter_entries) ? r.encounter_entries.length : 0,
  }));

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateEncounterBody;
  try {
    body = (await request.json()) as CreateEncounterBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

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

  const thumbParsed = parseOptionalThumbnailUrl(body.thumbnailUrl);
  if (!thumbParsed.ok) {
    return NextResponse.json({ error: 'Invalid thumbnailUrl' }, { status: 400 });
  }
  const descParsed = parseOptionalPlayerDescription(body.playerDescription);
  if (!descParsed.ok) {
    return NextResponse.json({ error: 'Invalid playerDescription' }, { status: 400 });
  }
  const thumbnailUrl = thumbParsed.value;
  const playerDescription = descParsed.value;

  const { systemFolderIds, error: ensureErr } = await ensureLibrarySystemFolders(supabase, user.id);
  if (ensureErr) {
    return NextResponse.json({ error: ensureErr }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { data: enc, error: encErr } = await supabase
    .from('encounters')
    .insert({
      user_id: user.id,
      title,
      updated_at: now,
      folder_id: systemFolderIds.encounters,
      thumbnail_url: thumbnailUrl,
      player_description: playerDescription,
    })
    .select('id')
    .single();

  if (encErr || !enc) {
    return NextResponse.json({ error: encErr?.message ?? 'Failed to create encounter' }, { status: 500 });
  }

  const encounterId = enc.id;
  const entryRows = entries.map((e, sort_order) => ({
    encounter_id: encounterId,
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
    await supabase.from('encounters').delete().eq('id', encounterId);
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: encounterId }, { status: 201 });
}
