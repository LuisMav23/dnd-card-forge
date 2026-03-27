-- Published cards/stat blocks: public read, view/fork counters, fork lineage

alter table public.cards
  add column if not exists is_published boolean not null default false;

alter table public.cards
  add column if not exists published_at timestamptz null;

alter table public.cards
  add column if not exists view_count bigint not null default 0;

alter table public.cards
  add column if not exists fork_count bigint not null default 0;

alter table public.cards
  add column if not exists forked_from_id uuid null;

alter table public.cards
  add column if not exists published_author_name text null;

alter table public.cards
  drop constraint if exists cards_forked_from_id_fkey;

alter table public.cards
  add constraint cards_forked_from_id_fkey
  foreign key (forked_from_id) references public.cards (id) on delete set null;

create index if not exists cards_published_list_idx
  on public.cards (is_published, published_at desc nulls last)
  where is_published = true;

create index if not exists cards_published_fork_count_idx
  on public.cards (is_published, fork_count desc)
  where is_published = true;

create index if not exists cards_published_view_count_idx
  on public.cards (is_published, view_count desc)
  where is_published = true;

drop policy if exists "Anyone can read published cards." on public.cards;
create policy "Anyone can read published cards."
  on public.cards for select
  using ( is_published = true );

create or replace function public.increment_published_card_view_count(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cards
  set view_count = view_count + 1
  where id = p_id and is_published = true;
end;
$$;

create or replace function public.increment_published_card_fork_count(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cards
  set fork_count = fork_count + 1
  where id = p_id and is_published = true;
end;
$$;

revoke all on function public.increment_published_card_view_count(uuid) from public;
grant execute on function public.increment_published_card_view_count(uuid) to anon;
grant execute on function public.increment_published_card_view_count(uuid) to authenticated;

revoke all on function public.increment_published_card_fork_count(uuid) from public;
grant execute on function public.increment_published_card_fork_count(uuid) to authenticated;
