-- Session tracking: HP and buff/debuff list per encounter line

alter table public.encounter_entries
  add column if not exists hp_current integer null;

alter table public.encounter_entries
  add column if not exists effects jsonb not null default '[]'::jsonb;

comment on column public.encounter_entries.hp_current is 'Runtime HP for this line; null = not tracking (UI can suggest max from stat block)';
comment on column public.encounter_entries.effects is 'JSON array of {id, label, kind: buff|debuff|neutral}';
