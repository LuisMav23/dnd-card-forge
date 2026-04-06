import { NextResponse } from 'next/server';
import { resolveDefaultCardFolderId } from '@/lib/ensureLibrarySystemFolders';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sourceId } = await params;
  if (!sourceId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: source, error: fetchErr } = await supabase
    .from('cards')
    .select('id, title, item_type, data, is_published, user_id')
    .eq('id', sourceId)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'explore/fork/POST/fetch');
  }
  if (!source || !source.is_published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (source.user_id === user.id) {
    return NextResponse.json({ error: 'Use duplicate for your own items' }, { status: 400 });
  }

  const itemType = source.item_type;
  if (itemType !== 'card' && itemType !== 'statblock') {
    return NextResponse.json({ error: 'Unsupported item type' }, { status: 400 });
  }

  const { folderId, error: folderErr } = await resolveDefaultCardFolderId(supabase, user.id, itemType);
  if (folderErr) {
    return internalError(folderErr, 'explore/fork/POST/folder');
  }

  const baseTitle = typeof source.title === 'string' ? source.title.trim() : 'Untitled';

  const { data: inserted, error: insErr } = await supabase
    .from('cards')
    .insert({
      user_id: user.id,
      folder_id: folderId,
      title: `${baseTitle} (fork)`,
      item_type: itemType,
      data: source.data,
      forked_from_id: sourceId,
    })
    .select()
    .single();

  if (insErr || !inserted) {
    return internalError(insErr ?? new Error('Fork failed'), 'explore/fork/POST/insert');
  }

  const { error: rpcErr } = await supabase.rpc('increment_published_card_fork_count', {
    p_id: sourceId,
  });

  if (rpcErr) {
    return internalError(rpcErr, 'explore/fork/POST/rpc');
  }

  return NextResponse.json(inserted);
}
