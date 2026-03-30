import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatActivityPhrase } from '@/lib/formatRelativeActivity';
import {
  fetchCardsForHomeActivity,
  fetchEncountersForActivity,
  mergeCardsAndEncountersIntoActivity,
} from '@/lib/recentActivity';
import { createClient } from '@/lib/supabase/server';
import { ITEM_CARD_GRID_CLASS } from '@/lib/itemCardGrid';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [profileResult, cardsResult, encountersResult] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    fetchCardsForHomeActivity(supabase, user.id, 30),
    fetchEncountersForActivity(supabase, user.id),
  ]);

  const profile = profileResult.data;
  const displayName =
    profile?.full_name?.trim() || user.email?.split('@')[0] || 'Adventurer';
  const avatarUrl = profile?.avatar_url?.trim() || null;

  const cardsForMerge = cardsResult.error ? [] : cardsResult.cards;
  const encountersForMerge = encountersResult.error ? [] : encountersResult.encounters;
  const activity = mergeCardsAndEncountersIntoActivity(cardsForMerge, encountersForMerge);

  const loadError =
    cardsResult.error || encountersResult.error || profileResult.error
      ? [cardsResult.error, encountersResult.error, profileResult.error].filter(Boolean).join(' ')
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-bdr bg-mid shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-[var(--font-cinzel),serif] text-3xl text-gold-dark/50">
                  ?
                </div>
              )}
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
                Welcome back
              </p>
              <h1 className="font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold [text-shadow:0_0_20px_rgba(201,168,76,0.2)] sm:text-3xl">
                {displayName}
              </h1>
              <Link
                href="/profile"
                className="text-sm text-bronze underline-offset-2 hover:text-gold hover:underline"
              >
                Edit profile
              </Link>
            </div>
          </div>

          {loadError && (
            <p className="mt-6 rounded-md border border-amber-800/60 bg-amber-950/40 p-3 text-center text-sm text-amber-100/90">
              Some data could not be loaded. {loadError}
            </p>
          )}

          <section className="mt-10" aria-labelledby="recent-activity-heading">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="recent-activity-heading"
                  className="font-[var(--font-cinzel),serif] text-lg font-semibold tracking-wide text-gold"
                >
                  Recent activity
                </h2>
                <p className="mt-1 text-sm text-bronze">Recently created or edited items.</p>
              </div>
            </div>

            {activity.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-bdr/80 bg-panel/40 p-8 text-center">
                <p className="text-sm text-bronze">Nothing here yet.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link href="/create" className="panel-btn border-gold/30 bg-gold/10 text-gold hover:bg-gold/20">
                    Create something
                  </Link>
                  <Link
                    href="/library"
                    className="panel-btn border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
                  >
                    My Library
                  </Link>
                </div>
              </div>
            ) : (
              <ul className={`mt-6 ${ITEM_CARD_GRID_CLASS}`}>
                {activity.map(item => (
                    <li key={`${item.kind}-${item.id}`} className="flex h-full min-h-0 min-w-0 flex-col">
                      <Link
                        href={item.href}
                        className="group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-bdr bg-panel/90 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-colors hover:border-gold/40 hover:shadow-[0_8px_28px_rgba(201,168,76,0.12)]"
                      >
                        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-mid/90">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                              <span className="text-2xl text-gold-dark/25" aria-hidden>
                                ◇
                              </span>
                              <span className="font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 p-3 pt-2.5">
                          <p className="truncate font-[var(--font-cinzel),serif] text-[0.8rem] font-bold leading-tight text-gold">
                            {item.title}
                          </p>
                          <p className="mt-auto text-[0.7rem] leading-snug text-bronze">
                            <span className="text-muted">{item.label}</span>
                            <span className="text-muted"> · </span>
                            <span>
                              {formatActivityPhrase(item.createdAt, item.updatedAt)}
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-3 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
