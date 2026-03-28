import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUuidString } from '@/lib/uuidValidate';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params;
  if (!targetId || !isUuidString(targetId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.id === targetId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  const { data: exists } = await supabase.rpc('get_user_public_profile', { p_user_id: targetId });
  const row = Array.isArray(exists) ? exists[0] : exists;
  if (!row || !(row as { id?: string }).id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { error } = await supabase.from('user_follows').insert({
    follower_id: user.id,
    following_id: targetId,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params;
  if (!targetId || !isUuidString(targetId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
