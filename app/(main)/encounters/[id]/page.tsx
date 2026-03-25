'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  const id = typeof params.id === 'string' ? params.id : '';
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resettingAll, setResettingAll] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      setDetail(data as EncounterDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
      setDetail(null);
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
              href="/encounters"
              className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
            >
              ← Encounters
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
              <Link href={`/encounters/${id}/edit`} className="panel-btn text-sm text-bronze">
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
              <Link href="/encounters" className="mt-4 inline-block text-gold underline">
                Back to list
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
