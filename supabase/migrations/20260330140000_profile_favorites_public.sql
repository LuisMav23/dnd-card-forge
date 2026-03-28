-- Public visibility for Explore favorites on user profiles

alter table public.user_profiles
  add column if not exists favorites_public boolean not null default false;

comment on column public.user_profiles.favorites_public is
  'When true, other users may see this user''s favorited published cards on their public profile.';

drop function if exists public.get_user_public_profile(uuid);

create function public.get_user_public_profile(p_user_id uuid)
returns table (
  id uuid,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamptz,
  favorites_public boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    u.full_name,
    u.bio,
    u.avatar_url,
    u.created_at,
    coalesce(u.favorites_public, false)
  from public.user_profiles u
  where u.id = p_user_id;
$$;

revoke all on function public.get_user_public_profile(uuid) from public;
grant execute on function public.get_user_public_profile(uuid) to anon, authenticated;

create or replace function public.get_user_public_favorite_card_ids(p_user_id uuid, p_limit int)
returns table (card_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select pcr.card_id
  from public.published_card_reactions pcr
  where pcr.user_id = p_user_id
    and pcr.favorited = true
    and (
      auth.uid() = p_user_id
      or coalesce(
        (select up.favorites_public from public.user_profiles up where up.id = p_user_id),
        false
      )
    )
  order by pcr.updated_at desc
  limit least(greatest(coalesce(p_limit, 48), 1), 48);
$$;

revoke all on function public.get_user_public_favorite_card_ids(uuid, int) from public;
grant execute on function public.get_user_public_favorite_card_ids(uuid, int) to anon, authenticated;
