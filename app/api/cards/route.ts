import { NextResponse } from 'next/server';
import { resolveDefaultCardFolderId } from '@/lib/ensureLibrarySystemFolders';
import { createClient } from '@/lib/supabase/server';
import { internalError } from '@/lib/apiError';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  let query = supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (folderId !== null) {
    if (folderId === 'null' || folderId === '') {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }
  }

  const { data, error } = await query;

  if (error) {
    return internalError(error, 'cards/GET');
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
    const body = await request.json();
    const { title, itemType, cardData, folderId } = body;

    let resolvedFolderId: string | null;
    if (folderId === undefined) {
      const { folderId: defId, error: folderErr } = await resolveDefaultCardFolderId(
        supabase,
        user.id,
        itemType
      );
      if (folderErr) {
        return internalError(folderErr, 'cards/POST/folder');
      }
      resolvedFolderId = defId;
    } else {
      resolvedFolderId = folderId === null || folderId === '' ? null : folderId;
    }

    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          user_id: user.id,
          folder_id: resolvedFolderId,
          title,
          item_type: itemType,
          data: cardData,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return internalError(err, 'cards/POST');
  }
}
