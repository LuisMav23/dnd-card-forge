alter table public.user_profiles
  add column if not exists bio text null,
  add column if not exists avatar_url text null;

comment on column public.user_profiles.bio is 'Short public bio (app enforces max length)';
comment on column public.user_profiles.avatar_url is 'Public URL for profile image (Supabase Storage)';
