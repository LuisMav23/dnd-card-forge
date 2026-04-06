import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function PATCH(
  request: Request,
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

  const { data: folder, error: fetchErr } = await supabase
    .from('folders')
    .select('id, folder_kind')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'folders/[id]/PATCH/fetch');
  }
  if (!folder) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (folder.folder_kind != null) {
    return NextResponse.json(
      { error: 'System folders cannot be renamed or edited.' },
      { status: 400 }
    );
  }

  let body: { name?: unknown; description?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const n = typeof body.name === 'string' ? body.name.trim() : '';
    if (!n) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    payload.name = n;
  }
  if (body.description !== undefined) {
    if (body.description === null) {
      payload.description = null;
    } else if (typeof body.description === 'string') {
      payload.description = body.description.trim() || null;
    } else {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('folders')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return internalError(error, 'folders/[id]/PATCH/update');
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: folder, error: fetchErr } = await supabase
    .from('folders')
    .select('folder_kind')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'folders/[id]/DELETE/fetch');
  }
  if (!folder) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (folder.folder_kind != null) {
    return NextResponse.json(
      { error: 'System folders (Cards, Stat blocks, Encounters) cannot be deleted.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return internalError(error, 'folders/[id]/DELETE');
  }

  return NextResponse.json({ success: true });
}
