-- Encounter cover art + player-facing description (session / builder)

alter table public.encounters
  add column if not exists thumbnail_url text null;

alter table public.encounters
  add column if not exists player_description text null;

comment on column public.encounters.thumbnail_url is 'Optional cover image (Supabase Storage public URL)';
comment on column public.encounters.player_description is 'Flavor notes visible during the session; editable in builder or live';
