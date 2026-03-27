import { NextResponse } from 'next/server';
import { resolveDefaultCardFolderId } from '@/lib/ensureLibrarySystemFolders';
import { createClient } from '@/lib/supabase/server';

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
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
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
    return NextResponse.json({ error: folderErr }, { status: 500 });
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
    return NextResponse.json({ error: insErr?.message ?? 'Fork failed' }, { status: 500 });
  }

  const { error: rpcErr } = await supabase.rpc('increment_published_card_fork_count', {
    p_id: sourceId,
  });

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }

  return NextResponse.json(inserted);
}
