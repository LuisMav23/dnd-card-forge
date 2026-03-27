import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LIST_FIELDS =
  'id, title, item_type, published_at, view_count, fork_count, published_author_name';

const SORTS = ['new', 'forked', 'popular'] as const;
type SortKey = (typeof SORTS)[number];

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

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const sortRaw = searchParams.get('sort') ?? 'new';
  const sort: SortKey = SORTS.includes(sortRaw as SortKey) ? (sortRaw as SortKey) : 'new';
  const itemType = searchParams.get('item_type');
  const limit = clampLimit(searchParams.get('limit'));
  const offset = clampOffset(searchParams.get('offset'));

  let query = supabase
    .from('cards')
    .select(LIST_FIELDS)
    .eq('is_published', true)
    .in('item_type', ['card', 'statblock']);

  if (itemType === 'card' || itemType === 'statblock') {
    query = query.eq('item_type', itemType);
  }

  if (sort === 'new') {
    query = query.order('published_at', { ascending: false, nullsFirst: false });
  } else if (sort === 'forked') {
    query = query.order('fork_count', { ascending: false }).order('published_at', {
      ascending: false,
      nullsFirst: false,
    });
  } else {
    query = query.order('view_count', { ascending: false }).order('published_at', {
      ascending: false,
      nullsFirst: false,
    });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], sort, limit, offset });
}
