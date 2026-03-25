'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/Header';
import EncounterListRowsSkeleton from '@/components/ui/skeletons/EncounterListRowsSkeleton';
import type { EncounterSummary } from '@/lib/encounterTypes';

export default function EncountersPage() {
  const [list, setList] = useState<EncounterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/encounters', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load encounters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete encounter “${title}”?`)) return;
    try {
      const res = await fetch(`/api/encounters/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setList(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="page-radial-soft flex min-h-screen flex-col bg-bg">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <header className="mx-auto flex w-full max-w-3xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
              Sessions
            </p>
            <h1 className="mt-2 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold sm:text-3xl">
              Encounters
            </h1>
            <p className="mt-2 max-w-xl text-sm text-bronze">
              Build encounter lists from your library stat blocks and track how many remain during play.
            </p>
          </div>
          <Link href="/encounters/new" className="panel-btn text-gold">
            New encounter
          </Link>
        </header>

        <div className="mx-auto w-full max-w-3xl">
          {loading && (
            <div role="status" aria-label="Loading encounters">
              <span className="sr-only">Loading encounters</span>
              <EncounterListRowsSkeleton />
            </div>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
          {!loading && !error && list.length === 0 && (
            <p className="text-sm text-bronze">
              No encounters yet.{' '}
              <Link href="/encounters/new" className="text-gold underline">
                Create one
              </Link>
              .
            </p>
          )}
          <ul className="space-y-3">
            {list.map(enc => (
              <li
                key={enc.id}
                className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-[var(--font-cinzel),serif] text-lg font-semibold text-gold">{enc.title}</h2>
                  <p className="text-xs text-muted">
                    {enc.entry_count} line{enc.entry_count === 1 ? '' : 's'} · Updated{' '}
                    {new Date(enc.updated_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  <Link href={`/encounters/${enc.id}`} className="panel-btn text-sm text-gold">
                    Open session
                  </Link>
                  <Link href={`/encounters/${enc.id}/edit`} className="panel-btn text-sm text-bronze">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(enc.id, enc.title)}
                    className="panel-btn text-sm text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
