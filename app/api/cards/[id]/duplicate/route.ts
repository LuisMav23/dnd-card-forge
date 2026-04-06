import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: row, error: fetchErr } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'cards/duplicate/POST/fetch');
  }
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const baseTitle = typeof row.title === 'string' ? row.title.trim() : 'Untitled';
  const { data: inserted, error: insErr } = await supabase
    .from('cards')
    .insert({
      user_id: user.id,
      folder_id: row.folder_id,
      title: `${baseTitle} (copy)`,
      item_type: row.item_type,
      data: row.data,
    })
    .select()
    .single();

  if (insErr || !inserted) {
    return internalError(insErr ?? new Error('Duplicate failed'), 'cards/duplicate/POST/insert');
  }

  return NextResponse.json(inserted);
}
