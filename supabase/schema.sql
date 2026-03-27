-- Create a table for folders
create table if not exists
  public.folders (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    name text not null,
    description text null,
    folder_kind text null,
    created_at timestamp with time zone not null default now(),
    constraint folders_pkey primary key (id),
    constraint folders_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint folders_folder_kind_check
      check (folder_kind is null or folder_kind in ('cards', 'statblocks', 'encounters'))
  );

create unique index if not exists folders_user_id_folder_kind_key
  on public.folders (user_id, folder_kind)
  where folder_kind is not null;

-- Create a table for cards (library cards + stat blocks; publish/explore columns optional for legacy DBs via migration)
create table if not exists
  public.cards (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    folder_id uuid null,
    title text not null,
    item_type text not null,
    data jsonb not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    is_published boolean not null default false,
    published_at timestamptz null,
    view_count bigint not null default 0,
    fork_count bigint not null default 0,
    forked_from_id uuid null,
    published_author_name text null,
    constraint cards_pkey primary key (id),
    constraint cards_folder_id_fkey foreign key (folder_id) references folders (id) on delete set null,
    constraint cards_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint cards_forked_from_id_fkey foreign key (forked_from_id) references public.cards (id) on delete set null
  );

-- Create a table for user profiles
create table if not exists
  public.user_profiles (
    id uuid not null,
    full_name text null,
    birth_date date null,
    gender text null,
    country text null,
    bio text null,
    avatar_url text null,
    created_at timestamp with time zone not null default now(),
    constraint user_profiles_pkey primary key (id),
    constraint user_profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
  );

-- Enable RLS
alter table public.folders enable row level security;
alter table public.cards enable row level security;
alter table public.user_profiles enable row level security;

-- Policies for user_profiles
drop policy if exists "Users can view their own profile." on public.user_profiles;
create policy "Users can view their own profile."
  on public.user_profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can insert their own profile." on public.user_profiles;
create policy "Users can insert their own profile."
  on public.user_profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update their own profile." on public.user_profiles;
create policy "Users can update their own profile."
  on public.user_profiles for update
  using ( auth.uid() = id );

-- Policies for folders
drop policy if exists "Users can insert their own folders." on public.folders;
create policy "Users can insert their own folders."
  on public.folders for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can select their own folders." on public.folders;
create policy "Users can select their own folders."
  on public.folders for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can update their own folders." on public.folders;
create policy "Users can update their own folders."
  on public.folders for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own folders." on public.folders;
create policy "Users can delete their own folders."
  on public.folders for delete
  using ( auth.uid() = user_id );

-- Policies for cards
drop policy if exists "Users can insert their own cards." on public.cards;
create policy "Users can insert their own cards."
  on public.cards for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can select their own cards." on public.cards;
create policy "Users can select their own cards."
  on public.cards for select
  using ( auth.uid() = user_id );

drop policy if exists "Anyone can read published cards." on public.cards;
create policy "Anyone can read published cards."
  on public.cards for select
  using ( is_published = true );

drop policy if exists "Users can update their own cards." on public.cards;
create policy "Users can update their own cards."
  on public.cards for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own cards." on public.cards;
create policy "Users can delete their own cards."
  on public.cards for delete
  using ( auth.uid() = user_id );

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

-- Encounters (see migrations/20250326120000_encounters.sql for canonical DDL + RLS)
