import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: encRow, error: encErr } = await supabase
    .from('encounters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (encErr) {
    return NextResponse.json({ error: encErr.message }, { status: 500 });
  }
  if (!encRow) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: entryRows, error: entErr } = await supabase
    .from('encounter_entries')
    .select('statblock_id, count, remaining, sort_order, hp_current, effects, instance_states')
    .eq('encounter_id', id)
    .order('sort_order', { ascending: true });

  if (entErr) {
    return NextResponse.json({ error: entErr.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const baseTitle = typeof encRow.title === 'string' ? encRow.title.trim() : 'Encounter';
  const { data: newEnc, error: insEncErr } = await supabase
    .from('encounters')
    .insert({
      user_id: user.id,
      title: `${baseTitle} (copy)`,
      updated_at: now,
      folder_id: encRow.folder_id ?? null,
      thumbnail_url:
        typeof encRow.thumbnail_url === 'string' && encRow.thumbnail_url.trim()
          ? encRow.thumbnail_url.trim()
          : null,
      player_description:
        typeof encRow.player_description === 'string' && encRow.player_description.trim()
          ? encRow.player_description.trim().slice(0, 8000)
          : null,
    })
    .select()
    .single();

  if (insEncErr || !newEnc) {
    return NextResponse.json({ error: insEncErr?.message ?? 'Failed to duplicate' }, { status: 500 });
  }

  const newId = newEnc.id;
  const entries = (entryRows ?? []).map((e, sort_order) => ({
    encounter_id: newId,
    statblock_id: e.statblock_id,
    count: e.count,
    remaining: e.remaining,
    sort_order,
    hp_current: e.hp_current,
    effects: e.effects ?? [],
    instance_states: e.instance_states,
  }));

  if (entries.length > 0) {
    const { error: insEntErr } = await supabase.from('encounter_entries').insert(entries);
    if (insEntErr) {
      await supabase.from('encounters').delete().eq('id', newId).eq('user_id', user.id);
      return NextResponse.json({ error: insEntErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    id: newId,
    title: newEnc.title,
    created_at: newEnc.created_at,
    updated_at: newEnc.updated_at,
    folder_id: newEnc.folder_id ?? null,
    entry_count: entries.length,
  });
}
