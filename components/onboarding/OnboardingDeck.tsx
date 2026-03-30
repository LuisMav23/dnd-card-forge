'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LogoMark from '@/components/LogoMark';
import SelectableTileGrid from '@/components/onboarding/SelectableTileGrid';
import ChoiceWithOther from '@/components/onboarding/ChoiceWithOther';
import {
  emptyOnboardingPayload,
  type OnboardingPayloadV1,
} from '@/lib/onboarding/types';
import {
  PRESET_GAMES,
  PRESET_MEDIA_MOVIES,
  PRESET_MEDIA_NOVELS,
  PRESET_WORLDS,
} from '@/lib/onboarding/presets';

const SLIDE_COUNT = 7;
const LAST_STEP = SLIDE_COUNT - 1;

export default function OnboardingDeck() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [payload, setPayload] = useState<OnboardingPayloadV1>(emptyOnboardingPayload);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const j = (await res.json()) as {
          profile?: { onboarding?: OnboardingPayloadV1 | null };
        };
        const o = j.profile?.onboarding;
        if (o && o.v === 1 && !cancelled) {
          setPayload({
            ...emptyOnboardingPayload(),
            ...o,
            v: 1,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goNext = useCallback(() => {
    setStep(s => Math.min(s + 1, LAST_STEP));
  }, []);

  const goPrev = useCallback(() => {
    setStep(s => Math.max(s - 1, 0));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartX.current;
      touchStartX.current = null;
      if (start == null) return;
      const end = e.changedTouches[0]?.clientX;
      if (end == null) return;
      const dx = end - start;
      if (dx < -56) goNext();
      else if (dx > 56) goPrev();
    },
    [goNext, goPrev]
  );

  const buildPayloadForSave = useCallback((): OnboardingPayloadV1 => {
    const notes = payload.notes?.trim() || null;
    const other =
      payload.primaryUse === 'other'
        ? (payload.primaryUseOther?.trim().slice(0, 500) || null)
        : null;
    return {
      ...payload,
      notes,
      primaryUseOther: other,
    };
  }, [payload]);

  const completeOnboarding = useCallback(
    async (skip: boolean) => {
      setSaving(true);
      setError(null);
      try {
        const body: Record<string, unknown> = {
          onboarding_completed_at: new Date().toISOString(),
        };
        body.onboarding = skip ? emptyOnboardingPayload() : buildPayloadForSave();

        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not save');
        }
        router.push('/home');
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setSaving(false);
      }
    },
    [buildPayloadForSave, router]
  );

  const renderSlide = (i: number) => {
    switch (i) {
      case 0:
        return (
          <div className="flex max-w-lg flex-col items-center text-center">
            <p className="mb-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.35em] text-gold-dark">
              Welcome
            </p>
            <h1 className="mb-4 font-[var(--font-cinzel),serif] text-2xl font-black tracking-[0.1em] text-gold sm:text-3xl">
              Tailor your forge
            </h1>
            <p className="text-sm leading-relaxed text-parch/90">
              A few quick questions help us understand how you play and what you love—so we can keep
              building the right tools for your table.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              What games do you play?
            </h2>
            <p className="max-w-md text-sm text-muted">Select all that apply. Add anything we missed.</p>
            <SelectableTileGrid
              presets={PRESET_GAMES}
              selected={payload.games}
              onChange={games => setPayload(p => ({ ...p, games }))}
            />
          </div>
        );
      case 2:
        return (
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              Movies &amp; shows
            </h2>
            <p className="max-w-md text-sm text-muted">
              Fantasy and TTRPG-inspired media you enjoy. Select all that apply.
            </p>
            <SelectableTileGrid
              presets={PRESET_MEDIA_MOVIES}
              selected={payload.mediaMovies}
              onChange={mediaMovies => setPayload(p => ({ ...p, mediaMovies }))}
            />
          </div>
        );
      case 3:
        return (
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              Novels &amp; series
            </h2>
            <p className="max-w-md text-sm text-muted">Books and sagas that inspire your games.</p>
            <SelectableTileGrid
              presets={PRESET_MEDIA_NOVELS}
              selected={payload.mediaNovels}
              onChange={mediaNovels => setPayload(p => ({ ...p, mediaNovels }))}
            />
          </div>
        );
      case 4:
        return (
          <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              Worlds &amp; settings
            </h2>
            <p className="max-w-md text-sm text-muted">Where do your adventures usually live?</p>
            <SelectableTileGrid
              presets={PRESET_WORLDS}
              selected={payload.worlds}
              onChange={worlds => setPayload(p => ({ ...p, worlds }))}
            />
          </div>
        );
      case 5:
        return (
          <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              What will you use Card Forge for?
            </h2>
            <p className="max-w-md text-sm text-muted">Pick the closest match. You can elaborate if you choose Other.</p>
            <ChoiceWithOther
              value={payload.primaryUse}
              otherText={payload.primaryUseOther}
              onValueChange={primaryUse => setPayload(p => ({ ...p, primaryUse }))}
              onOtherTextChange={primaryUseOther => setPayload(p => ({ ...p, primaryUseOther }))}
            />
          </div>
        );
      case 6:
        return (
          <div className="flex w-full max-w-lg flex-col items-center gap-4 text-center">
            <h2 className="font-[var(--font-cinzel),serif] text-xl font-bold tracking-wide text-gold sm:text-2xl">
              Anything else?
            </h2>
            <p className="text-sm text-muted">Optional—share context, goals, or systems we should know about.</p>
            <textarea
              rows={5}
              maxLength={2000}
              value={payload.notes ?? ''}
              onChange={e => setPayload(p => ({ ...p, notes: e.target.value || null }))}
              className="w-full rounded-md border border-bdr bg-mid px-4 py-3 text-left text-sm text-parch placeholder:text-placeholder/80 dark:bg-field-bg"
              placeholder="Your notes…"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-hero-gradient relative flex min-h-[100dvh] flex-col bg-bg">
      <div className="auth-page-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 text-gold-dark transition-opacity hover:opacity-90 dark:text-gold sm:left-6 sm:top-6"
        aria-label="Card Forge home"
      >
        <LogoMark className="h-10 w-10 sm:h-11 sm:w-11" />
      </Link>

      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden pt-14"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full min-h-[min(32rem,calc(100dvh-8rem))] w-full"
          style={{
            transform: `translate3d(-${step * 100}%, 0, 0)`,
            transition: reduceMotion ? 'none' : 'transform 320ms ease-out',
          }}
        >
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <div
              key={i}
              className="flex h-full w-full min-w-full shrink-0 flex-col items-center justify-center overflow-y-auto px-5 pb-36 pt-6 sm:px-8"
            >
              {renderSlide(i)}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-bdr/60 bg-panel/95 px-4 py-4 backdrop-blur-sm dark:bg-panel/90">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-gold' : 'w-1.5 bg-bdr'
                }`}
              />
            ))}
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-800/80 bg-red-950/50 p-2 text-center text-xs text-red-200"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0 || saving}
              className="panel-btn border-bdr bg-transparent px-4 py-2 text-xs text-gold-dark hover:bg-input disabled:pointer-events-none disabled:opacity-40 dark:text-gold"
            >
              Back
            </button>
            <div className="flex flex-wrap justify-end gap-2">
              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={saving}
                  className="panel-btn px-5 py-2 text-xs disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => completeOnboarding(true)}
                    disabled={saving}
                    className="panel-btn border-bdr bg-transparent px-4 py-2 text-xs text-gold-dark hover:bg-input disabled:opacity-50 dark:text-gold"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => completeOnboarding(false)}
                    disabled={saving}
                    className="panel-btn px-5 py-2 text-xs disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Finish'}
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-center text-[0.65rem] text-muted">
            Swipe left or right to move between steps
          </p>
        </div>
      </div>
    </div>
  );
}
