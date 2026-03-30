import type { SupabaseClient, User } from '@supabase/supabase-js';

function stringFromMeta(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

/**
 * Ensures user_profiles has a row for OAuth users so public RPCs (e.g. get_user_public_profile) work.
 * Fills missing full_name / avatar_url from Google user_metadata when present.
 */
export async function bootstrapOAuthProfile(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const meta = user.user_metadata ?? {};
  const fromMetaName =
    stringFromMeta(meta.full_name) ?? stringFromMeta(meta.name);
  const fromMetaAvatar =
    stringFromMeta(meta.avatar_url) ?? stringFromMeta(meta.picture);

  const { data: existing, error: selectErr } = await supabase
    .from('user_profiles')
    .select(
      'full_name, avatar_url, birth_date, gender, country, bio, favorites_public, onboarding, onboarding_completed_at'
    )
    .eq('id', user.id)
    .maybeSingle();

  if (selectErr) {
    console.error('bootstrapOAuthProfile: select failed', selectErr.message);
    return;
  }

  const hasName = Boolean(existing?.full_name && String(existing.full_name).trim());
  const hasAvatar = Boolean(existing?.avatar_url && String(existing.avatar_url).trim());

  const shouldUpsert =
    !existing ||
    (!hasName && Boolean(fromMetaName)) ||
    (!hasAvatar && Boolean(fromMetaAvatar));

  if (!shouldUpsert) {
    return;
  }

  const row = {
    id: user.id,
    full_name: hasName ? existing!.full_name : fromMetaName ?? null,
    birth_date: existing?.birth_date ?? null,
    gender: existing?.gender ?? null,
    country: existing?.country ?? null,
    bio: existing?.bio ?? null,
    avatar_url: hasAvatar ? existing!.avatar_url : fromMetaAvatar ?? null,
    favorites_public: Boolean(existing?.favorites_public),
    onboarding: existing?.onboarding ?? null,
    onboarding_completed_at: existing?.onboarding_completed_at ?? null,
  };

  const { error: upsertErr } = await supabase
    .from('user_profiles')
    .upsert(row, { onConflict: 'id' });

  if (upsertErr) {
    console.error('bootstrapOAuthProfile: upsert failed', upsertErr.message);
  }
}
