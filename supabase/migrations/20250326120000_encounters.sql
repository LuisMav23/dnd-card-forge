-- Encounters: DM session lists of library stat blocks with live remaining counts

create table if not exists public.encounters (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint encounters_pkey primary key (id),
  constraint encounters_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create table if not exists public.encounter_entries (
  id uuid not null default gen_random_uuid(),
  encounter_id uuid not null,
  statblock_id uuid null,
  count int not null,
  remaining int not null,
  sort_order int not null default 0,
  constraint encounter_entries_pkey primary key (id),
  constraint encounter_entries_encounter_id_fkey
    foreign key (encounter_id) references public.encounters (id) on delete cascade,
  constraint encounter_entries_statblock_id_fkey
    foreign key (statblock_id) references public.cards (id) on delete set null,
  constraint encounter_entries_count_positive check (count > 0),
  constraint encounter_entries_remaining_bounds check (remaining >= 0 and remaining <= count)
);

create index if not exists encounter_entries_encounter_sort_idx
  on public.encounter_entries (encounter_id, sort_order);

alter table public.encounters enable row level security;
alter table public.encounter_entries enable row level security;

-- encounters: owner only
drop policy if exists "Users can select own encounters." on public.encounters;
create policy "Users can select own encounters."
  on public.encounters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own encounters." on public.encounters;
create policy "Users can insert own encounters."
  on public.encounters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own encounters." on public.encounters;
create policy "Users can update own encounters."
  on public.encounters for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own encounters." on public.encounters;
create policy "Users can delete own encounters."
  on public.encounters for delete
  using (auth.uid() = user_id);

-- encounter_entries: via parent encounter ownership
drop policy if exists "Users can select entries of own encounters." on public.encounter_entries;
create policy "Users can select entries of own encounters."
  on public.encounter_entries for select
  using (
    exists (
      select 1 from public.encounters e
      where e.id = encounter_entries.encounter_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert entries of own encounters." on public.encounter_entries;
create policy "Users can insert entries of own encounters."
  on public.encounter_entries for insert
  with check (
    exists (
      select 1 from public.encounters e
      where e.id = encounter_entries.encounter_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update entries of own encounters." on public.encounter_entries;
create policy "Users can update entries of own encounters."
  on public.encounter_entries for update
  using (
    exists (
      select 1 from public.encounters e
      where e.id = encounter_entries.encounter_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete entries of own encounters." on public.encounter_entries;
create policy "Users can delete entries of own encounters."
  on public.encounter_entries for delete
  using (
    exists (
      select 1 from public.encounters e
      where e.id = encounter_entries.encounter_id and e.user_id = auth.uid()
    )
  );
