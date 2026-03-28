import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUuidString } from '@/lib/uuidValidate';

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 24;
  if (Number.isNaN(n)) return 24;
  return Math.min(50, Math.max(1, n));
}

function clampOffset(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 0;
  if (Number.isNaN(n) || n < 0) return 0;
  return n;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !isUuidString(id)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const limit = clampLimit(searchParams.get('limit'));
  const offset = clampOffset(searchParams.get('offset'));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_user_followers_public', {
    p_user_id: id,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], limit, offset });
}
