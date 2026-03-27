import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
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
    return NextResponse.json({ error: insErr?.message ?? 'Duplicate failed' }, { status: 500 });
  }

  return NextResponse.json(inserted);
}
