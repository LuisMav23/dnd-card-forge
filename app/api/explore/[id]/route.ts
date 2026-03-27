import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PUBLISHED_FIELDS =
  'id, title, item_type, data, published_at, view_count, fork_count, published_author_name, user_id';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cards')
    .select(PUBLISHED_FIELDS)
    .eq('id', id)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock'])
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { user_id: _omit, ...rest } = data as Record<string, unknown> & { user_id: string };
  return NextResponse.json(rest);
}
