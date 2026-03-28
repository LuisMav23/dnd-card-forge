'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import EncounterSessionEntry from '@/components/encounters/EncounterSessionEntry';
import { EncounterSessionLinesSkeleton } from '@/components/ui/skeletons/EncounterSessionSkeleton';
import Skeleton from '@/components/ui/Skeleton';
import { parseEncounterInstanceStatesArray } from '@/lib/encounterStatHelpers';
import type {
  EncounterDetail,
  EncounterEffect,
  EncounterEntryDetail,
  EncounterInstanceState,
} from '@/lib/encounterTypes';

function mergeEffects(raw: unknown): EncounterEffect[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is EncounterEffect =>
      Boolean(x) &&
      typeof x === 'object' &&
      typeof (x as EncounterEffect).id === 'string' &&
      typeof (x as EncounterEffect).label === 'string' &&
      ['buff', 'debuff', 'neutral'].includes((x as EncounterEffect).kind)
  );
}

export default function EncounterSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const fromLibrary = searchParams.get('from') === 'library';
  const backHref = fromLibrary ? '/library' : '/encounters';
  const backLabel = fromLibrary ? '← Library' : '← Encounters';
  const sessionQs = fromLibrary ? '?from=library' : '';
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resettingAll, setResettingAll] = useState(false);
  const [playerDescDraft, setPlayerDescDraft] = useState('');
  const [descSaving, setDescSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      const d = data as EncounterDetail;
      setDetail(d);
      setPlayerDescDraft(d.player_description ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setDetail(null);
      setPlayerDescDraft('');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchEntry = useCallback(
    async (entryId: string, body: Record<string, unknown>) => {
      setBusyId(entryId);
      try {
        const res = await fetch(`/api/encounters/${id}/entries/${entryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        setDetail(prev =>
          prev
            ? {
                ...prev,
                updated_at: new Date().toISOString(),
                entries: prev.entries.map((e): EncounterEntryDetail => {
                  if (e.id !== entryId) return e;
                  const parsedInstances = parseEncounterInstanceStatesArray(data.instances, e.count);
                  let instances: EncounterInstanceState[];
                  if (parsedInstances) {
                    instances = parsedInstances;
                  } else {
                    instances = e.instances.map(s => ({
                      hp_current: s.hp_current,
                      effects: s.effects.map(f => ({ ...f })),
                    }));
                    if (instances.length > 0) {
                      const z = instances[0];
                      instances[0] = {
                        hp_current:
                          data.hp_current !== undefined
                            ? (data.hp_current as number | null)
                            : z.hp_current,
                        effects: Array.isArray(data.effects) ? mergeEffects(data.effects) : z.effects,
                      };
                    }
                  }
                  const first = instances[0] ?? { hp_current: null, effects: [] };
                  return {
                    ...e,
                    remaining: typeof data.remaining === 'number' ? data.remaining : e.remaining,
                    hp_current: first.hp_current,
                    effects: first.effects,
                    instances,
                  };
                }),
              }
            : null
        );
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Update failed');
        void load();
      } finally {
        setBusyId(null);
      }
    },
    [id, load]
  );

  const savePlayerDescription = async () => {
    if (!id) return;
    setDescSaving(true);
    try {
      const trimmed = playerDescDraft.trim();
      const res = await fetch(`/api/encounters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerDescription: trimmed.length > 0 ? trimmed : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDetail(prev =>
        prev ? { ...prev, player_description: trimmed.length > 0 ? trimmed : null } : null
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setDescSaving(false);
    }
  };

  const resetAll = async () => {
    if (!detail?.entries.length) return;
    setResettingAll(true);
    try {
      for (const e of detail.entries) {
        const instance_states = Array.from({ length: e.count }, () => ({
          hp_current: e.hp_max_hint ?? null,
          effects: [] as EncounterEffect[],
        }));
        const res = await fetch(`/api/encounters/${id}/entries/${e.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remaining: e.count,
            instance_states,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Reset failed');
      void load();
    } finally {
      setResettingAll(false);
    }
  };

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-start justify-between gap-4 px-0">
          <div>
            <Link
              href={backHref}
              className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
            >
              {backLabel}
            </Link>
            {loading && (
              <div className="mt-3 space-y-2" aria-hidden>
                <Skeleton className="h-9 w-64 max-w-full sm:h-10" />
                <Skeleton className="h-3 w-full max-w-2xl" />
              </div>
            )}
            {detail && (
              <>
                <h1 className="mt-3 font-[var(--font-cinzel),serif] text-2xl font-bold text-gold sm:text-3xl">
                  {detail.title}
                </h1>
                <p className="mt-1 max-w-2xl text-xs text-muted">
                  Each active creature has its own stat card, HP, and conditions. Layout is two columns from tablet size up,
                  three on very large screens. Everything saves automatically.
                </p>
              </>
            )}
          </div>
          {loading && (
            <div className="flex flex-wrap gap-2" aria-hidden>
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          )}
          {detail && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/encounters/${id}/edit${sessionQs}`}
                className="panel-btn text-sm text-bronze"
              >
                Edit encounter
              </Link>
              <button
                type="button"
                onClick={resetAll}
                disabled={resettingAll || !detail.entries.length}
                className="panel-btn text-sm text-parch disabled:opacity-50"
              >
                {resettingAll ? 'Resetting…' : 'Reset all'}
              </button>
            </div>
          )}
        </div>

        {detail && (
          <section
            className="mx-auto mb-2 w-full max-w-[1600px] rounded-xl border border-bdr/80 bg-panel/40 px-4 py-4 sm:px-5"
            aria-labelledby="enc-player-desc-heading"
          >
            <h2
              id="enc-player-desc-heading"
              className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark"
            >
              Description for players
            </h2>
            <p className="mt-1 text-xs text-muted">
              Scene setup, read-aloud, or notes for the table. Save anytime during the session.
            </p>
            <textarea
              value={playerDescDraft}
              onChange={e => setPlayerDescDraft(e.target.value)}
              maxLength={8000}
              rows={6}
              className="encounter-form-control mt-3 min-h-[8rem] w-full resize-y rounded-md border border-bdr-2 bg-input px-3 py-2 font-[var(--font-crimson),Georgia,serif] text-sm leading-relaxed text-fg placeholder:text-placeholder focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/15 sm:min-h-[9rem]"
              placeholder="Optional — add or update what players should know or hear…"
              aria-label="Player-facing encounter description"
            />
            <div className="mt-3 flex justify-end border-t border-bdr/50 pt-3">
              <button
                type="button"
                onClick={() => void savePlayerDescription()}
                disabled={descSaving}
                className="panel-btn text-sm text-gold disabled:opacity-50"
              >
                {descSaving ? 'Saving…' : 'Save description'}
              </button>
            </div>
          </section>
        )}

        <div className="mx-auto w-full max-w-[1600px]">
          {loading && (
            <div role="status" aria-label="Loading encounter">
              <span className="sr-only">Loading encounter</span>
              <EncounterSessionLinesSkeleton />
            </div>
          )}
          {error && (
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <Link href={backHref} className="mt-4 inline-block text-gold underline">
                {fromLibrary ? 'Back to library' : 'Back to list'}
              </Link>
            </div>
          )}

          {detail && (
            <ul className="space-y-4">
              {detail.entries.map(e => (
                <EncounterSessionEntry key={e.id} entry={e} busy={busyId === e.id} onPatch={patchEntry} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
