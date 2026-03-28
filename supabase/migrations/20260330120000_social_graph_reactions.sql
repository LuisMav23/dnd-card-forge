-- Social: follows, published card reactions + denormalized counts, safe public profile RPCs

-- 1) Reaction counters on published cards
alter table public.cards
  add column if not exists upvote_count bigint not null default 0;

alter table public.cards
  add column if not exists downvote_count bigint not null default 0;

alter table public.cards
  add column if not exists favorite_count bigint not null default 0;

-- 2) Follow graph
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_follows_pkey primary key (follower_id, following_id),
  constraint user_follows_no_self check (follower_id <> following_id)
);

create index if not exists user_follows_follower_idx on public.user_follows (follower_id);
create index if not exists user_follows_following_idx on public.user_follows (following_id);

alter table public.user_follows enable row level security;

drop policy if exists "Users insert own follows." on public.user_follows;
create policy "Users insert own follows."
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users delete own follows." on public.user_follows;
create policy "Users delete own follows."
  on public.user_follows for delete
  using (auth.uid() = follower_id);

drop policy if exists "Users select own follow edges." on public.user_follows;
create policy "Users select own follow edges."
  on public.user_follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

-- 3) Per-user reactions on published cards
create table if not exists public.published_card_reactions (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  vote smallint not null default 0,
  favorited boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint published_card_reactions_pkey primary key (user_id, card_id),
  constraint published_card_reactions_vote_check check (vote in (-1, 0, 1))
);

create index if not exists published_card_reactions_card_idx on public.published_card_reactions (card_id);

alter table public.published_card_reactions enable row level security;

drop policy if exists "Users manage own reactions." on public.published_card_reactions;
create policy "Users manage own reactions."
  on public.published_card_reactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) Validate published target; maintain counts
create or replace function public.published_card_reactions_validate()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.cards c
    where c.id = new.card_id and c.is_published = true
  ) then
    raise exception 'card must be published';
  end if;
  return new;
end;
$$;

drop trigger if exists published_card_reactions_validate_trg on public.published_card_reactions;
create trigger published_card_reactions_validate_trg
  before insert or update on public.published_card_reactions
  for each row execute function public.published_card_reactions_validate();

create or replace function public.published_card_reactions_count_apply()
returns trigger
language plpgsql
as $$
declare
  target uuid;
  d_up bigint := 0;
  d_down bigint := 0;
  d_fav bigint := 0;
begin
  if tg_op = 'DELETE' then
    target := old.card_id;
    if old.vote = 1 then d_up := -1; elsif old.vote = -1 then d_down := -1; end if;
    if old.favorited then d_fav := -1; end if;
  elsif tg_op = 'UPDATE' then
    target := new.card_id;
    if old.vote = 1 then d_up := d_up - 1; elsif old.vote = -1 then d_down := d_down - 1; end if;
    if old.favorited then d_fav := d_fav - 1; end if;
    if new.vote = 1 then d_up := d_up + 1; elsif new.vote = -1 then d_down := d_down + 1; end if;
    if new.favorited then d_fav := d_fav + 1; end if;
  else
    target := new.card_id;
    if new.vote = 1 then d_up := 1; elsif new.vote = -1 then d_down := 1; end if;
    if new.favorited then d_fav := 1; end if;
  end if;

  update public.cards
  set
    upvote_count = greatest(0::bigint, upvote_count + d_up),
    downvote_count = greatest(0::bigint, downvote_count + d_down),
    favorite_count = greatest(0::bigint, favorite_count + d_fav)
  where id = target;

  return coalesce(new, old);
end;
$$;

drop trigger if exists published_card_reactions_count_trg on public.published_card_reactions;
create trigger published_card_reactions_count_trg
  after insert or update or delete on public.published_card_reactions
  for each row execute function public.published_card_reactions_count_apply();

-- 5) SECURITY DEFINER read helpers (no PII beyond public profile fields)
create or replace function public.get_user_public_profile(p_user_id uuid)
returns table (
  id uuid,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.full_name, u.bio, u.avatar_url, u.created_at
  from public.user_profiles u
  where u.id = p_user_id;
$$;

create or replace function public.get_user_follow_counts(p_user_id uuid)
returns table (
  follower_count bigint,
  following_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::bigint from public.user_follows uf where uf.following_id = p_user_id),
    (select count(*)::bigint from public.user_follows uf where uf.follower_id = p_user_id);
$$;

create or replace function public.get_user_followers_public(p_user_id uuid, p_limit int, p_offset int)
returns table (
  id uuid,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select up.id, up.full_name, up.bio, up.avatar_url, up.created_at
  from public.user_follows uf
  join public.user_profiles up on up.id = uf.follower_id
  where uf.following_id = p_user_id
  order by uf.created_at desc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

create or replace function public.get_user_following_public(p_user_id uuid, p_limit int, p_offset int)
returns table (
  id uuid,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select up.id, up.full_name, up.bio, up.avatar_url, up.created_at
  from public.user_follows uf
  join public.user_profiles up on up.id = uf.following_id
  where uf.follower_id = p_user_id
  order by uf.created_at desc
  limit least(greatest(p_limit, 1), 50)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.get_user_public_profile(uuid) from public;
grant execute on function public.get_user_public_profile(uuid) to anon, authenticated;

revoke all on function public.get_user_follow_counts(uuid) from public;
grant execute on function public.get_user_follow_counts(uuid) to anon, authenticated;

revoke all on function public.get_user_followers_public(uuid, int, int) from public;
grant execute on function public.get_user_followers_public(uuid, int, int) to anon, authenticated;

revoke all on function public.get_user_following_public(uuid, int, int) from public;
grant execute on function public.get_user_following_public(uuid, int, int) to anon, authenticated;
