/**
 * Onboarding payload stored in user_profiles.onboarding (jsonb).
 * Bump `v` when the shape changes and handle legacy in the app if needed.
 */
export const ONBOARDING_VERSION = 1 as const;

export const PRIMARY_USE_OPTIONS = [
  'player_cards',
  'dm_tools',
  'stat_blocks',
  'explore_publish',
  'learning',
  'other',
] as const;

export type PrimaryUseOption = (typeof PRIMARY_USE_OPTIONS)[number];

export type OnboardingPayloadV1 = {
  v: typeof ONBOARDING_VERSION;
  games: string[];
  mediaMovies: string[];
  mediaNovels: string[];
  worlds: string[];
  primaryUse: PrimaryUseOption | null;
  primaryUseOther: string | null;
  notes: string | null;
};

export type OnboardingPayload = OnboardingPayloadV1;

export function emptyOnboardingPayload(): OnboardingPayloadV1 {
  return {
    v: ONBOARDING_VERSION,
    games: [],
    mediaMovies: [],
    mediaNovels: [],
    worlds: [],
    primaryUse: null,
    primaryUseOther: null,
    notes: null,
  };
}
