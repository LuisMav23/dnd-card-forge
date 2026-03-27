-- System library folders (Cards, Stat blocks, Encounters) + encounter folder assignment

alter table public.folders
  add column if not exists folder_kind text null;

alter table public.folders
  drop constraint if exists folders_folder_kind_check;

alter table public.folders
  add constraint folders_folder_kind_check
  check (folder_kind is null or folder_kind in ('cards', 'statblocks', 'encounters'));

create unique index if not exists folders_user_id_folder_kind_key
  on public.folders (user_id, folder_kind)
  where folder_kind is not null;

alter table public.encounters
  add column if not exists folder_id uuid null;

alter table public.encounters
  drop constraint if exists encounters_folder_id_fkey;

alter table public.encounters
  add constraint encounters_folder_id_fkey
  foreign key (folder_id) references public.folders (id) on delete set null;
