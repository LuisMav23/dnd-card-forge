import type { SupabaseClient } from '@supabase/supabase-js';

export type SystemFolderKind = 'cards' | 'statblocks' | 'encounters';

const KIND_ORDER: SystemFolderKind[] = ['cards', 'statblocks', 'encounters'];

const KIND_LABELS: Record<SystemFolderKind, string> = {
  cards: 'Cards',
  statblocks: 'Stat blocks',
  encounters: 'Encounters',
};

export type SystemFolderIds = {
  cards: string | null;
  statblocks: string | null;
  encounters: string | null;
};

/**
 * Ensures the three system folders exist, backfills null folder_id rows, returns ids.
 */
export async function ensureLibrarySystemFolders(
  supabase: SupabaseClient,
  userId: string
): Promise<{ error: string | null; systemFolderIds: SystemFolderIds }> {
  const emptyIds: SystemFolderIds = { cards: null, statblocks: null, encounters: null };

  for (const kind of KIND_ORDER) {
    const { data: existing, error: selErr } = await supabase
      .from('folders')
      .select('id')
      .eq('user_id', userId)
      .eq('folder_kind', kind)
      .maybeSingle();

    if (selErr) {
      return { error: selErr.message, systemFolderIds: emptyIds };
    }

    if (!existing) {
      const { error: insErr } = await supabase.from('folders').insert({
        user_id: userId,
        name: KIND_LABELS[kind],
        folder_kind: kind,
      });
      if (insErr) {
        return { error: insErr.message, systemFolderIds: emptyIds };
      }
    }
  }

  const { data: systemRows, error: listErr } = await supabase
    .from('folders')
    .select('id, folder_kind')
    .eq('user_id', userId)
    .not('folder_kind', 'is', null);

  if (listErr) {
    return { error: listErr.message, systemFolderIds: emptyIds };
  }

  const systemFolderIds: SystemFolderIds = { cards: null, statblocks: null, encounters: null };
  for (const row of systemRows ?? []) {
    const k = row.folder_kind as SystemFolderKind | null;
    if (k === 'cards' || k === 'statblocks' || k === 'encounters') {
      systemFolderIds[k] = row.id;
    }
  }

  const { cards: cardsFolderId, statblocks: statFolderId, encounters: encFolderId } = systemFolderIds;

  if (cardsFolderId) {
    const { error: u1 } = await supabase
      .from('cards')
      .update({ folder_id: cardsFolderId })
      .eq('user_id', userId)
      .is('folder_id', null)
      .eq('item_type', 'card');
    if (u1) return { error: u1.message, systemFolderIds };
  }

  if (statFolderId) {
    const { error: u2 } = await supabase
      .from('cards')
      .update({ folder_id: statFolderId })
      .eq('user_id', userId)
      .is('folder_id', null)
      .eq('item_type', 'statblock');
    if (u2) return { error: u2.message, systemFolderIds };
  }

  if (encFolderId) {
    const { error: u3 } = await supabase
      .from('encounters')
      .update({ folder_id: encFolderId })
      .eq('user_id', userId)
      .is('folder_id', null);
    if (u3) return { error: u3.message, systemFolderIds };
  }

  return { error: null, systemFolderIds };
}

/**
 * Default folder for a new card row when the client omits folderId.
 */
export async function resolveDefaultCardFolderId(
  supabase: SupabaseClient,
  userId: string,
  itemType: string
): Promise<{ folderId: string | null; error: string | null }> {
  const { error, systemFolderIds } = await ensureLibrarySystemFolders(supabase, userId);
  if (error) {
    return { folderId: null, error };
  }
  const kind: keyof SystemFolderIds = itemType === 'statblock' ? 'statblocks' : 'cards';
  return { folderId: systemFolderIds[kind], error: null };
}
