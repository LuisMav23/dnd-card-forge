-- Optional folder description for library UI

alter table public.folders
  add column if not exists description text null;
