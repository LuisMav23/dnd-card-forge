-- Keep votes (reactions) and comments when a card is unpublished.
-- While unpublished: only the card owner can read/act via owner-specific paths; republishing restores public access with same counts.

-- 1) Reactions: allow upsert when card is published OR caller is the card owner (private preview / stats intact).
create or replace function public.published_card_reactions_validate ()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from public.cards c where c.id = new.card_id) then
    raise exception 'card not found';
  end if;
  if not exists (
    select 1
    from public.cards c
    where c.id = new.card_id
      and (
        c.is_published = true
        or c.user_id = auth.uid ()
      )
  ) then
    raise exception 'reactions not allowed for this card';
  end if;
  return new;
end;
$$;

-- 2) Comments: allow insert when published OR owner is adding (e.g. note while private).
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
    where c.id = new.card_id
      and (
        c.is_published = true
        or c.user_id = auth.uid ()
      )
  ) then
    raise exception 'comments not allowed for this card';
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

-- 3) Comment SELECT: public thread when published; full thread for card owner when unpublished.
drop policy if exists "Read comments on published cards." on public.published_card_comments;
drop policy if exists "Read comments on published or own unpublished card." on public.published_card_comments;
create policy "Read comments on published or own unpublished card."
  on public.published_card_comments for select
  using (
    exists (
      select 1
      from public.cards c
      where c.id = published_card_comments.card_id
        and (
          c.is_published = true
          or c.user_id = auth.uid ()
        )
    )
  );

-- 4) Comment INSERT: must be own row; card published or owner (matches trigger).
drop policy if exists "Insert own comments on published cards." on public.published_card_comments;
create policy "Insert own comments on published or own card."
  on public.published_card_comments for insert
  with check (
    auth.uid () = user_id
    and exists (
      select 1
      from public.cards c
      where c.id = published_card_comments.card_id
        and (
          c.is_published = true
          or c.user_id = auth.uid ()
        )
    )
  );

-- 5) RPC: list comments for published cards (anyone) or unpublished (owner only).
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
      select 1
      from public.cards x
      where x.id = p_card_id
        and (
          x.is_published = true
          or x.user_id = auth.uid ()
        )
    )
  order by c.created_at asc
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
  offset greatest(coalesce(p_offset, 0), 0);
$$;
