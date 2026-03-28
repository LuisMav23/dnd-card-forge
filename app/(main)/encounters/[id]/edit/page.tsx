'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import EncounterBuilderForm from '@/components/encounters/EncounterBuilderForm';
import { EncounterFormFieldsSkeleton } from '@/components/ui/skeletons/EncounterFormSkeleton';
import type { EncounterDetail } from '@/lib/encounterTypes';

export default function EditEncounterPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto mb-8 w-full max-w-2xl">
          <Link
            href={`/encounters/${id}`}
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
          >
            ← Session view
          </Link>
          <h1 className="mt-4 font-[var(--font-cinzel),serif] text-2xl font-bold text-gold">Edit encounter</h1>
        </div>

        {loading && (
          <div className="mx-auto max-w-2xl w-full" role="status" aria-label="Loading encounter">
            <span className="sr-only">Loading encounter</span>
            <EncounterFormFieldsSkeleton />
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-red-300">{error}</p>
            <Link href="/encounters" className="mt-4 inline-block text-gold underline">
              Back to list
            </Link>
          </div>
        )}
        {detail && (
          <EncounterBuilderForm
            initialTitle={detail.title}
            initialThumbnailUrl={detail.thumbnail_url}
            initialPlayerDescription={detail.player_description ?? ''}
            initialRows={detail.entries.map(e => ({
              statblockId: e.statblock_id ?? '',
              count: e.count,
            })).filter(r => r.statblockId)}
            submitLabel="Save changes"
            cancelHref={`/encounters/${id}`}
            onSubmit={async payload => {
              const res = await fetch(`/api/encounters/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: payload.title,
                  entries: payload.entries,
                  thumbnailUrl: payload.thumbnailUrl,
                  playerDescription: payload.playerDescription || null,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Could not save');
              router.push(`/encounters/${id}`);
              router.refresh();
            }}
          />
        )}
        {detail && detail.entries.some(e => !e.statblock_id) && (
          <p className="mx-auto mt-4 max-w-2xl text-xs text-muted">
            Lines with removed library stat blocks were dropped. Re-add a stat block if needed.
          </p>
        )}
      </main>
    </div>
  );
}
