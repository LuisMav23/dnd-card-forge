-- Threaded comments on published explore items (cards / stat blocks)

create table if not exists public.published_card_comments (
  id uuid not null default gen_random_uuid (),
  card_id uuid not null references public.cards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid null,
  body text not null,
  created_at timestamptz not null default now (),
  constraint published_card_comments_pkey primary key (id),
  constraint published_card_comments_body_len check (
    char_length(body) >= 1 and char_length(body) <= 4000
  ),
  constraint published_card_comments_parent_fkey
    foreign key (parent_id) references public.published_card_comments (id) on delete cascade
);

create index if not exists published_card_comments_card_created_idx
  on public.published_card_comments (card_id, created_at asc);

create index if not exists published_card_comments_parent_idx
  on public.published_card_comments (parent_id)
  where parent_id is not null;

alter table public.published_card_comments enable row level security;

create or replace function public.published_card_comments_validate ()
returns trigger
language plpgsql
as $$
declare
  parent_card uuid;
begin
  if not exists (
    select 1
    from public.cards c
    where c.id = new.card_id and c.is_published = true
  ) then
    raise exception 'card must be published';
  end if;

  if new.parent_id is not null then
    select pc.card_id into parent_card
    from public.published_card_comments pc
    where pc.id = new.parent_id;

    if parent_card is null then
      raise exception 'parent comment not found';
    end if;

    if parent_card <> new.card_id then
      raise exception 'parent comment belongs to another card';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists published_card_comments_validate_trg on public.published_card_comments;
create trigger published_card_comments_validate_trg
  before insert on public.published_card_comments
  for each row execute function public.published_card_comments_validate ();

drop policy if exists "Read comments on published cards." on public.published_card_comments;
create policy "Read comments on published cards."
  on public.published_card_comments for select
  using (
    exists (
      select 1
      from public.cards c
      where c.id = published_card_comments.card_id and c.is_published = true
    )
  );

drop policy if exists "Insert own comments on published cards." on public.published_card_comments;
create policy "Insert own comments on published cards."
  on public.published_card_comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Delete own comments on published cards." on public.published_card_comments;
create policy "Delete own comments on published cards."
  on public.published_card_comments for delete
  using (auth.uid() = user_id);

-- List comments with author display fields (user_profiles RLS blocks cross-user reads otherwise)
create or replace function public.get_published_card_comments (p_card_id uuid, p_limit int, p_offset int)
returns table (
  id uuid,
  card_id uuid,
  user_id uuid,
  parent_id uuid,
  body text,
  created_at timestamptz,
  author_full_name text,
  author_avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.card_id,
    c.user_id,
    c.parent_id,
    c.body,
    c.created_at,
    coalesce(nullif(trim(up.full_name), ''), '')::text as author_full_name,
    up.avatar_url::text as author_avatar_url
  from public.published_card_comments c
  left join public.user_profiles up on up.id = c.user_id
  where c.card_id = p_card_id
    and exists (
      select 1 from public.cards x where x.id = p_card_id and x.is_published = true
    )
  order by c.created_at asc
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.get_published_card_comments (uuid, int, int) from public;
grant execute on function public.get_published_card_comments (uuid, int, int) to anon;
grant execute on function public.get_published_card_comments (uuid, int, int) to authenticated;
