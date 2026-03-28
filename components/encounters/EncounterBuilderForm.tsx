'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EncounterThumbnailUpload from '@/components/encounters/EncounterThumbnailUpload';
import EncounterBuilderLibrarySkeleton from '@/components/ui/skeletons/EncounterBuilderLibrarySkeleton';
import { useEncounterAutosave, type EncounterAutosaveLoadState } from '@/hooks/useEncounterAutosave';
import type { CreateEncounterBody, EncounterBuilderPayload } from '@/lib/encounterTypes';
import { labelForStatblockCard } from './statblockLabel';

type LibraryRow = {
  id: string;
  title: string;
  item_type: string;
  data: Record<string, unknown> | null;
};

type BuilderRow = { key: string; statblockId: string; count: number };

function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type { EncounterBuilderPayload };

export type EncounterBuilderAutosaveConfig = {
  encounterId: string | null;
  loadState: EncounterAutosaveLoadState;
  fromLibrary: boolean;
  router: { replace: (href: string) => void };
};

interface Props {
  initialTitle: string;
  initialRows: { statblockId: string; count: number }[];
  initialThumbnailUrl?: string | null;
  initialPlayerDescription?: string | null;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (payload: EncounterBuilderPayload) => Promise<void>;
  autosave?: EncounterBuilderAutosaveConfig;
}

export default function EncounterBuilderForm({
  initialTitle,
  initialRows,
  initialThumbnailUrl = null,
  initialPlayerDescription = '',
  submitLabel,
  cancelHref,
  onSubmit,
  autosave,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialThumbnailUrl ?? null);
  const [playerDescription, setPlayerDescription] = useState(initialPlayerDescription ?? '');
  const [rows, setRows] = useState<BuilderRow[]>(() =>
    initialRows.length > 0
      ? initialRows.map(r => ({ key: newKey(), statblockId: r.statblockId, count: r.count }))
      : []
  );
  const [statblocks, setStatblocks] = useState<LibraryRow[]>([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encounterPayload = useMemo(
    (): EncounterBuilderPayload => ({
      title,
      entries: rows.map(r => ({ statblockId: r.statblockId, count: r.count })),
      thumbnailUrl,
      playerDescription,
    }),
    [title, rows, thumbnailUrl, playerDescription]
  );

  const persistPost = useCallback(async (body: CreateEncounterBody) => {
    const res = await fetch('/api/encounters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: body.title,
        entries: body.entries,
        thumbnailUrl: body.thumbnailUrl,
        playerDescription: body.playerDescription,
      }),
    });
    const data = (await res.json()) as { id?: string; error?: string };
    if (!res.ok) throw new Error(data.error || 'Could not create');
    if (!data.id) throw new Error('Create did not return an id');
    return { id: data.id };
  }, []);

  const persistPatch = useCallback(async (encId: string, body: CreateEncounterBody) => {
    const res = await fetch(`/api/encounters/${encId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: body.title,
        entries: body.entries,
        thumbnailUrl: body.thumbnailUrl,
        playerDescription: body.playerDescription,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error || 'Could not save');
  }, []);

  const noopRouter = useMemo(() => ({ replace: () => undefined }), []);

  const { autosaveHint, autosaveBusy } = useEncounterAutosave({
    enabled: Boolean(autosave),
    payload: encounterPayload,
    encounterIdFromUrl: autosave?.encounterId ?? null,
    loadState: autosave?.loadState ?? 'ready',
    fromLibrary: autosave?.fromLibrary ?? false,
    router: autosave?.router ?? noopRouter,
    persistPost,
    persistPatch,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cards', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load library');
        if (!cancelled) {
          const list = (Array.isArray(data) ? data : []) as LibraryRow[];
          setStatblocks(list.filter(c => c.item_type === 'statblock'));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load stat blocks');
      } finally {
        if (!cancelled) setLoadingLib(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(
    () =>
      statblocks.map(c => ({
        id: c.id,
        label: labelForStatblockCard(c),
      })),
    [statblocks]
  );

  const addRow = useCallback(() => {
    const first = options[0]?.id ?? '';
    setRows(prev => [...prev, { key: newKey(), statblockId: first, count: 1 }]);
  }, [options]);

  const removeRow = useCallback((key: string) => {
    setRows(prev => prev.filter(r => r.key !== key));
  }, []);

  const updateRow = useCallback((key: string, patch: Partial<Pick<BuilderRow, 'statblockId' | 'count'>>) => {
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    if (!t) {
      setError('Title is required');
      return;
    }
    if (rows.length === 0) {
      setError('Add at least one stat block line');
      return;
    }
    for (const r of rows) {
      if (!r.statblockId) {
        setError('Each line must have a stat block selected');
        return;
      }
      if (!Number.isInteger(r.count) || r.count < 1) {
        setError('Each count must be at least 1');
        return;
      }
    }
    setSaving(true);
    try {
      await onSubmit({
        title: t,
        entries: rows.map(r => ({ statblockId: r.statblockId, count: r.count })),
        thumbnailUrl,
        playerDescription: playerDescription.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <label htmlFor="enc-title" className="block font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark">
          Encounter title
        </label>
        <input
          id="enc-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="encounter-form-control mt-2 w-full rounded-md border border-bdr-2 px-3 py-2 font-[var(--font-crimson),Georgia,serif] text-base placeholder:text-placeholder focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/15"
          placeholder="e.g. Crypt ambush"
          maxLength={200}
        />
      </div>

      <EncounterThumbnailUpload imageUrl={thumbnailUrl} onImageChange={setThumbnailUrl} />

      <div>
        <label htmlFor="enc-player-desc" className="block font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark">
          Description for players
        </label>
        <p className="mt-1 text-xs text-muted">
          Scene setup, read-aloud, or table notes. Shown on the live encounter page; anyone running the session can edit it there too.
        </p>
        <textarea
          id="enc-player-desc"
          value={playerDescription}
          onChange={e => setPlayerDescription(e.target.value)}
          rows={5}
          maxLength={8000}
          placeholder="Optional — e.g. The bridge groans underfoot; mist hides the far shore…"
          className="encounter-form-control mt-2 w-full resize-y rounded-md border border-bdr-2 px-3 py-2 font-[var(--font-crimson),Georgia,serif] text-base leading-relaxed placeholder:text-placeholder focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/15"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark">
            Stat blocks in this encounter
          </span>
          <button
            type="button"
            onClick={addRow}
            disabled={loadingLib || options.length === 0}
            className="panel-btn text-xs disabled:opacity-50"
          >
            + Add line
          </button>
        </div>

        {loadingLib && (
          <div className="mt-3" role="status" aria-label="Loading library">
            <span className="sr-only">Loading your library</span>
            <EncounterBuilderLibrarySkeleton />
          </div>
        )}
        {!loadingLib && options.length === 0 && (
          <p className="mt-3 text-sm text-bronze">
            No stat blocks in your library yet.{' '}
            <Link href="/statblocks" className="text-gold underline hover:text-gold-light">
              Create stat blocks
            </Link>{' '}
            and save them to the library first.
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {rows.map(r => (
            <li
              key={r.key}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-bdr bg-panel/80 p-3 sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <label className="text-[0.65rem] uppercase tracking-wider text-muted">Stat block</label>
                <select
                  value={r.statblockId}
                  onChange={e => updateRow(r.key, { statblockId: e.target.value })}
                  className="encounter-form-control mt-1 w-full rounded-md border border-bdr-2 bg-input px-2 py-2 font-[var(--font-crimson),Georgia,serif] text-sm text-fg"
                >
                  {options.length === 0 ? (
                    <option value="">—</option>
                  ) : (
                    options.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="w-24">
                <label className="text-[0.65rem] uppercase tracking-wider text-muted">Count</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={r.count}
                  onChange={e => updateRow(r.key, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="encounter-form-control mt-1 w-full rounded-md border border-bdr-2 bg-input px-2 py-2 font-[var(--font-crimson),Georgia,serif] text-sm text-fg"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(r.key)}
                className="panel-btn border-red-900/50 text-xs text-red-300 hover:bg-red-950/40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {autosaveHint ? (
        <p className="text-center text-[0.65rem] leading-snug text-muted">{autosaveHint}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || autosaveBusy || options.length === 0}
          className="panel-btn text-gold disabled:opacity-50"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <Link href={cancelHref} className="panel-btn text-bronze">
          Cancel
        </Link>
      </div>
    </form>
  );
}
