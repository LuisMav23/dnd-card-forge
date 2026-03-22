import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BIO_MAX = 500;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('full_name, birth_date, gender, country, bio, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('id, title, item_type, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(12);

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 500 });
  }

  return NextResponse.json({
    email: user.email ?? null,
    profile: data ?? {
      full_name: null,
      birth_date: null,
      gender: null,
      country: null,
      bio: null,
      avatar_url: null,
      created_at: null,
    },
    recentCreations: cards ?? [],
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data: existing } = await supabase
      .from('user_profiles')
      .select('full_name, birth_date, gender, country, bio, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const row: Record<string, unknown> = { id: user.id };

    if (body.full_name !== undefined) {
      row.full_name = typeof body.full_name === 'string' ? body.full_name.trim() || null : null;
    } else {
      row.full_name = existing?.full_name ?? null;
    }

    if (body.birth_date !== undefined) {
      row.birth_date =
        typeof body.birth_date === 'string' ? body.birth_date || null : null;
    } else {
      row.birth_date = existing?.birth_date ?? null;
    }

    if (body.gender !== undefined) {
      row.gender = typeof body.gender === 'string' ? body.gender.trim() || null : null;
    } else {
      row.gender = existing?.gender ?? null;
    }

    if (body.country !== undefined) {
      row.country = typeof body.country === 'string' ? body.country.trim() || null : null;
    } else {
      row.country = existing?.country ?? null;
    }

    if (body.bio !== undefined) {
      if (typeof body.bio === 'string') {
        const t = body.bio.trim();
        if (t.length > BIO_MAX) {
          return NextResponse.json(
            { error: `Bio must be ${BIO_MAX} characters or fewer` },
            { status: 400 }
          );
        }
        row.bio = t || null;
      } else {
        row.bio = null;
      }
    } else {
      row.bio = existing?.bio ?? null;
    }

    if (body.avatar_url !== undefined) {
      row.avatar_url =
        body.avatar_url === null || body.avatar_url === ''
          ? null
          : typeof body.avatar_url === 'string'
            ? body.avatar_url
            : null;
    } else {
      row.avatar_url = existing?.avatar_url ?? null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(row, { onConflict: 'id' })
      .select(
        'full_name, birth_date, gender, country, bio, avatar_url, created_at'
      )
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
