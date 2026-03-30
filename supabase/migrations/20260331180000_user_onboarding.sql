-- Onboarding wizard answers (private; not exposed via public profile RPCs)

alter table public.user_profiles
  add column if not exists onboarding jsonb,
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.user_profiles.onboarding is
  'Versioned onboarding questionnaire answers (JSON).';

comment on column public.user_profiles.onboarding_completed_at is
  'Set when the user completes or skips onboarding; null means wizard required.';

-- Existing accounts skip the wizard (one-time at migration)
update public.user_profiles
set onboarding_completed_at = now()
where onboarding_completed_at is null;
