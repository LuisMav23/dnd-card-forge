-- If published_card_comments was created without a primary key, self-FK cannot exist.
-- Add PK and parent FK when missing (safe when table is empty or id is unique).

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'published_card_comments'
  ) then
    if not exists (
      select 1
      from pg_constraint
      where conrelid = 'public.published_card_comments'::regclass
        and contype = 'p'
    ) then
      alter table public.published_card_comments
        add constraint published_card_comments_pkey primary key (id);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = 'public.published_card_comments'::regclass
        and conname = 'published_card_comments_parent_fkey'
    ) then
      alter table public.published_card_comments
        add constraint published_card_comments_parent_fkey
        foreign key (parent_id) references public.published_card_comments (id) on delete cascade;
    end if;
  end if;
end;
$$;
