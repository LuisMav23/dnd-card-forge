import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: exists } = await supabase
    .from('cards')
    .select('id')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (!exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase.rpc('increment_published_card_view_count', { p_id: id });

  if (error) {
    return internalError(error, 'explore/view/POST');
  }

  return NextResponse.json({ ok: true });
}
