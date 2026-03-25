-- Per-creature session row: HP + effects for each slot (length = count)

alter table public.encounter_entries
  add column if not exists instance_states jsonb null;

comment on column public.encounter_entries.instance_states is
  'JSON array of length count: [{ hp_current, effects: [{id,label,kind}] }]; null = derive from hp_current/effects';
