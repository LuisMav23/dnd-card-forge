import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { storagePathsFromLibraryCardRow } from '@/lib/storage/paths';
import { removeStorageObjectsServer } from '@/lib/storage/removeStorageObjectsServer';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    
    // Convert camelCase to snake_case if necessary, e.g. folderId -> folder_id
    const payload: Record<string, unknown> = {};
    if (updates.folderId !== undefined) {
      payload.folder_id = updates.folderId;
    }
    if (updates.title !== undefined) {
      payload.title = updates.title;
    }
    if (updates.cardData !== undefined) {
      payload.data = updates.cardData;
    }
    if (payload.title !== undefined || payload.data !== undefined) {
      payload.updated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cards')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row } = await supabase
    .from('cards')
    .select('data, item_type')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (row?.data) {
    const paths = storagePathsFromLibraryCardRow(row.item_type, row.data);
    await removeStorageObjectsServer(paths);
  }

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
