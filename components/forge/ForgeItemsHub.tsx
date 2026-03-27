'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import EncounterListRowsSkeleton from '@/components/ui/skeletons/EncounterListRowsSkeleton';
import { forgeItemDisplayName, forgeItemKindLabel } from '@/lib/forgeHubDisplay';

export type ForgeHubCardRow = {
  id: string;
  title: string;
  item_type: string;
  data: unknown;
  created_at: string;
  updated_at: string;
};

type ForgeItemsHubProps = {
  itemTypeFilter: 'card' | 'statblock';
  eyebrow: string;
  heading: string;
  description: string;
  routePrefix: 'card' | 'statblocks';
  newButtonLabel: string;
};

export default function ForgeItemsHub({
  itemTypeFilter,
  eyebrow,
  heading,
  description,
  routePrefix,
  newButtonLabel,
}: ForgeItemsHubProps) {
  const [list, setList] = useState<ForgeHubCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cards', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      const rows = Array.isArray(data) ? (data as ForgeHubCardRow[]) : [];
      setList(rows.filter(r => r.item_type === itemTypeFilter));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load items');
    } finally {
      setLoading(false);
    }
  }, [itemTypeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string, displayName: string) => {
    if (!window.confirm(`Delete “${displayName}”?`)) return;
    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setList(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const newHref = `/${routePrefix}/new`;

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <header className="mx-auto flex w-full max-w-3xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold sm:text-3xl">
              {heading}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-bronze">{description}</p>
          </div>
          <Link href={newHref} className="panel-btn text-gold">
            {newButtonLabel}
          </Link>
        </header>

        <div className="mx-auto w-full max-w-3xl">
          {loading && (
            <div role="status" aria-label={`Loading ${heading}`}>
              <span className="sr-only">Loading {heading}</span>
              <EncounterListRowsSkeleton />
            </div>
          )}
          {error && <p className="text-sm text-red-300">{error}</p>}
          {!loading && !error && list.length === 0 && (
            <p className="text-sm text-bronze">
              Nothing here yet.{' '}
              <Link href={newHref} className="text-gold underline">
                Create one
              </Link>
              .
            </p>
          )}
          <ul className="space-y-3">
            {list.map(row => {
              const displayName = forgeItemDisplayName(row);
              const kind = forgeItemKindLabel(itemTypeFilter, row.data);
              return (
                <li
                  key={row.id}
                  className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-[var(--font-cinzel),serif] text-lg font-semibold uppercase tracking-wide text-gold">
                      {displayName}
                    </h2>
                    <p className="text-xs text-muted">
                      {kind} · Updated{' '}
                      {new Date(row.updated_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <Link
                      href={`/${routePrefix}/${row.id}`}
                      className="panel-btn text-sm text-gold"
                    >
                      View
                    </Link>
                    <Link
                      href={`/${routePrefix}/new?library=${row.id}`}
                      className="panel-btn text-sm text-bronze"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row.id, displayName)}
                      className="panel-btn text-sm text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
