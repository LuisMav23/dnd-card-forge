import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return internalError(error, 'folders/GET');
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const desc =
      description === undefined || description === null
        ? null
        : typeof description === 'string'
          ? description.trim() || null
          : null;

    const { data, error } = await supabase
      .from('folders')
      .insert([{ user_id: user.id, name: String(name).trim(), description: desc }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return internalError(err, 'folders/POST');
  }
}
