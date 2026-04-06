import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

function uniqueCopyName(existingNames: Set<string>, baseName: string): string {
  let candidate = `${baseName} (copy)`;
  let i = 2;
  while (existingNames.has(candidate)) {
    candidate = `${baseName} (copy ${i})`;
    i += 1;
  }
  return candidate;
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sourceFolderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: sourceFolder, error: folderErr } = await supabase
    .from('folders')
    .select('id, name, description, folder_kind')
    .eq('id', sourceFolderId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (folderErr) {
    return internalError(folderErr, 'folders/duplicate/POST/fetch');
  }
  if (!sourceFolder) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (sourceFolder.folder_kind != null) {
    return NextResponse.json({ error: 'System folders cannot be duplicated.' }, { status: 400 });
  }

  const { data: allFolders, error: namesErr } = await supabase
    .from('folders')
    .select('name')
    .eq('user_id', user.id);

  if (namesErr) {
    return internalError(namesErr, 'folders/duplicate/POST/names');
  }

  const nameSet = new Set((allFolders ?? []).map(r => r.name));
  const newName = uniqueCopyName(nameSet, sourceFolder.name);

  const { data: newFolder, error: insFolderErr } = await supabase
    .from('folders')
    .insert({
      user_id: user.id,
      name: newName,
      description: sourceFolder.description ?? null,
      folder_kind: null,
    })
    .select()
    .single();

  if (insFolderErr || !newFolder) {
    return internalError(insFolderErr ?? new Error('Failed to create folder'), 'folders/duplicate/POST/insert');
  }

  const newFolderId = newFolder.id;

  const { data: folderCards, error: cardsErr } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .eq('folder_id', sourceFolderId);

  if (cardsErr) {
    await supabase.from('folders').delete().eq('id', newFolderId).eq('user_id', user.id);
    return internalError(cardsErr, 'folders/duplicate/POST/cards');
  }

  const duplicatedCards: unknown[] = [];
  for (const row of folderCards ?? []) {
    const baseTitle = typeof row.title === 'string' ? row.title.trim() : 'Untitled';
    const { data: inserted, error: cErr } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        folder_id: newFolderId,
        title: `${baseTitle} (copy)`,
        item_type: row.item_type,
        data: row.data,
      })
      .select()
      .single();

    if (cErr || !inserted) {
      await supabase.from('cards').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('folders').delete().eq('id', newFolderId);
      return internalError(cErr ?? new Error('Failed to duplicate card'), 'folders/duplicate/POST/card-insert');
    }
    duplicatedCards.push(inserted);
  }

  const { data: folderEncounters, error: encListErr } = await supabase
    .from('encounters')
    .select('id')
    .eq('user_id', user.id)
    .eq('folder_id', sourceFolderId);

  if (encListErr) {
    await supabase.from('cards').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
    await supabase.from('folders').delete().eq('id', newFolderId).eq('user_id', user.id);
    return internalError(encListErr, 'folders/duplicate/POST/encounters-list');
  }

  const duplicatedEncounters: unknown[] = [];

  for (const encRef of folderEncounters ?? []) {
    const { data: encRow, error: encFetchErr } = await supabase
      .from('encounters')
      .select('*')
      .eq('id', encRef.id)
      .eq('user_id', user.id)
      .single();

    if (encFetchErr || !encRow) {
      await supabase.from('encounters').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('cards').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('folders').delete().eq('id', newFolderId).eq('user_id', user.id);
      return internalError(encFetchErr ?? new Error('Encounter not found'), 'folders/duplicate/POST/enc-fetch');
    }

    const { data: entryRows, error: entFetchErr } = await supabase
      .from('encounter_entries')
      .select(
        'statblock_id, count, remaining, sort_order, hp_current, effects, instance_states'
      )
      .eq('encounter_id', encRef.id)
      .order('sort_order', { ascending: true });

    if (entFetchErr) {
      await supabase.from('encounters').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('cards').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('folders').delete().eq('id', newFolderId).eq('user_id', user.id);
      return internalError(entFetchErr, 'folders/duplicate/POST/entries-fetch');
    }

    const now = new Date().toISOString();
    const baseEncTitle =
      typeof encRow.title === 'string' ? encRow.title.trim() : 'Encounter';
    const { data: newEnc, error: insEncErr } = await supabase
      .from('encounters')
      .insert({
        user_id: user.id,
        title: `${baseEncTitle} (copy)`,
        updated_at: now,
        folder_id: newFolderId,
      })
      .select()
      .single();

    if (insEncErr || !newEnc) {
      await supabase.from('encounters').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('cards').delete().eq('folder_id', newFolderId).eq('user_id', user.id);
      await supabase.from('folders').delete().eq('id', newFolderId).eq('user_id', user.id);
      return internalError(insEncErr ?? new Error('Failed to duplicate encounter'), 'folders/duplicate/POST/enc-insert');
    }

    const newEncId = newEnc.id;
    const entries = (entryRows ?? []).map((e, sort_order) => ({
      encounter_id: newEncId,
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
        await supabase.from('encounters').delete().eq('id', newEncId);
        await supabase.from('folders').delete().eq('id', newFolderId);
        return internalError(insEntErr, 'folders/duplicate/POST/entries-insert');
      }
    }

    duplicatedEncounters.push({
      ...newEnc,
      entry_count: entries.length,
    });
  }

  return NextResponse.json({
    folder: newFolder,
    duplicatedCards,
    duplicatedEncounters,
  });
}
