'use client';

import Link from 'next/link';
import { useState } from 'react';
import StatBlockRenderer from '@/components/statblocks/StatBlockRenderer';
import type {
  EncounterEffect,
  EncounterEffectKind,
  EncounterEntryDetail,
  EncounterInstanceState,
} from '@/lib/encounterTypes';
import type { StatBlockState } from '@/lib/statblockTypes';

function entryLineTitle(e: EncounterEntryDetail): string {
  return e.statblock_name?.trim() || e.statblock_title?.trim() || 'Removed stat block';
}

function effectChipClass(kind: EncounterEffectKind): string {
  if (kind === 'buff') return 'border-emerald-800/60 bg-emerald-950/35 text-emerald-100';
  if (kind === 'debuff') return 'border-red-900/50 bg-red-950/35 text-red-100';
  return 'border-bdr bg-mid/80 text-parch';
}

function withSessionLabel(state: StatBlockState, baseName: string, index1: number): StatBlockState {
  const label = `(${baseName} #${index1})`;
  return { ...state, fields: { ...state.fields, name: label } };
}

function InstancePanel({
  entryId,
  instanceIndex,
  count,
  slot,
  hpMaxHint,
  busy,
  onPatch,
}: {
  entryId: string;
  instanceIndex: number;
  count: number;
  slot: EncounterInstanceState;
  hpMaxHint: number | null;
  busy: boolean;
  onPatch: (entryId: string, body: Record<string, unknown>) => Promise<void>;
}) {
  const [effectLabel, setEffectLabel] = useState('');
  const [effectKind, setEffectKind] = useState<EncounterEffectKind>('buff');
  const [hpInput, setHpInput] = useState('');

  const patch = (body: Record<string, unknown>) =>
    onPatch(entryId, count > 1 ? { ...body, instance_index: instanceIndex } : body);

  const hpDisplay =
    slot.hp_current !== null
      ? slot.hp_current
      : hpMaxHint !== null
        ? `(${hpMaxHint} max)`
        : '—';

  const applyHpDelta = async (delta: number) => {
    let base = slot.hp_current;
    if (base === null) {
      base = hpMaxHint ?? 0;
    }
    const next = Math.max(0, base + delta);
    await patch({ hp_current: next });
  };

  const setHpToMax = async () => {
    if (hpMaxHint === null) return;
    await patch({ hp_current: hpMaxHint });
  };

  const clearHpTracking = async () => {
    await patch({ hp_current: null });
  };

  const applyHpFromInput = async () => {
    const n = parseInt(hpInput.trim(), 10);
    if (Number.isNaN(n) || n < 0) return;
    await patch({ hp_current: n });
    setHpInput('');
  };

  const addEffect = async () => {
    const t = effectLabel.trim();
    if (!t) return;
    const next: EncounterEffect = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fx-${Date.now()}`,
      label: t.slice(0, 120),
      kind: effectKind,
    };
    await patch({ effects: [...slot.effects, next] });
    setEffectLabel('');
  };

  const removeEffect = async (id: string) => {
    await patch({ effects: slot.effects.filter(x => x.id !== id) });
  };

  return (
    <div className="rounded-lg border border-bdr/80 bg-mid/40 p-3 sm:p-4">
      <h3 className="font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">
        Hit points
      </h3>
      <p className="mt-1 text-[0.7rem] text-muted">
        +/− uses stat block max when tracking has not started yet.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-[var(--font-cinzel),serif] text-2xl font-bold tabular-nums text-parch">
          {slot.hp_current !== null ? slot.hp_current : hpDisplay}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => applyHpDelta(-1)}
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-bdr bg-mid text-lg font-bold text-gold hover:border-gold-dark disabled:opacity-40"
          aria-label="Subtract 1 HP"
        >
          −
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => applyHpDelta(1)}
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-bdr bg-mid text-lg font-bold text-gold hover:border-gold-dark disabled:opacity-40"
          aria-label="Add 1 HP"
        >
          +
        </button>
        {hpMaxHint !== null && (
          <button
            type="button"
            disabled={busy}
            onClick={setHpToMax}
            className="panel-btn text-[0.6rem] text-bronze"
          >
            Max ({hpMaxHint})
          </button>
        )}
        <button
          type="button"
          disabled={busy || slot.hp_current === null}
          onClick={clearHpTracking}
          className="panel-btn text-[0.6rem] text-muted disabled:opacity-40"
        >
          Clear HP
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <input
          type="number"
          min={0}
          max={9999}
          value={hpInput}
          onChange={ev => setHpInput(ev.target.value)}
          placeholder="Set HP…"
          className="encounter-form-control w-24 rounded-md border border-bdr-2 px-2 py-1.5 font-[var(--font-crimson),serif] text-sm"
        />
        <button type="button" disabled={busy} onClick={applyHpFromInput} className="panel-btn text-xs">
          Apply
        </button>
      </div>

      <h3 className="mt-4 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">
        Buffs &amp; debuffs
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {slot.effects.length === 0 ? (
          <span className="text-xs text-muted">None</span>
        ) : (
          slot.effects.map(fx => (
            <span
              key={fx.id}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] ${effectChipClass(fx.kind)}`}
            >
              <span className="font-medium">{fx.label}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => removeEffect(fx.id)}
                className="text-muted hover:text-parch disabled:opacity-40"
                aria-label={`Remove ${fx.label}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <input
          type="text"
          value={effectLabel}
          onChange={ev => setEffectLabel(ev.target.value)}
          placeholder="Blessed, poisoned…"
          maxLength={120}
          className="encounter-form-control min-w-[8rem] flex-1 rounded-md border border-bdr-2 px-2 py-1.5 font-[var(--font-crimson),serif] text-sm placeholder:text-placeholder"
        />
        <select
          value={effectKind}
          onChange={ev => setEffectKind(ev.target.value as EncounterEffectKind)}
          className="encounter-form-control rounded-md border border-bdr-2 px-2 py-1.5 font-[var(--font-crimson),serif] text-sm"
        >
          <option value="buff">Buff</option>
          <option value="debuff">Debuff</option>
          <option value="neutral">Other</option>
        </select>
        <button type="button" disabled={busy} onClick={addEffect} className="panel-btn text-xs">
          Add
        </button>
      </div>
    </div>
  );
}

interface Props {
  entry: EncounterEntryDetail;
  busy: boolean;
  onPatch: (entryId: string, body: Record<string, unknown>) => Promise<void>;
}

export default function EncounterSessionEntry({ entry: e, busy, onPatch }: Props) {
  const lineTitle = entryLineTitle(e);
  const baseName = e.statblock_name?.trim() || e.statblock_title?.trim() || 'Creature';

  const setRemaining = async (next: number) => {
    await onPatch(e.id, { remaining: next });
  };

  const resetRow = async () => {
    await onPatch(e.id, {
      remaining: e.count,
      instance_states: Array.from({ length: e.count }, () => ({
        hp_current: e.hp_max_hint ?? null,
        effects: [] as EncounterEffect[],
      })),
    });
  };

  const defaultHp = e.hp_max_hint ?? null;
  const atDefault =
    e.remaining === e.count &&
    e.instances.length === e.count &&
    e.instances.every(s => s.hp_current === defaultHp && s.effects.length === 0);

  const instancesAligned =
    e.instances.length === e.count
      ? e.instances
      : Array.from({ length: e.count }, (_, i) => e.instances[i] ?? { hp_current: null, effects: [] });

  return (
    <li className="rounded-xl border border-bdr bg-panel/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-[var(--font-cinzel),serif] text-lg font-semibold text-gold">{lineTitle}</h2>
            {e.statblock_id ? (
              <Link
                href={`/statblocks/${e.statblock_id}`}
                className="mt-1 inline-block text-xs text-gold-dark underline hover:text-gold"
              >
                Open stat block wiki
              </Link>
            ) : (
              <p className="mt-1 text-xs text-muted">This library item was removed.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-[var(--font-cinzel),serif] text-2xl font-bold tabular-nums text-parch sm:text-3xl">
              {e.remaining}
              <span className="text-lg font-normal text-muted"> / {e.count}</span>
            </span>
            <span className="text-xs uppercase tracking-wider text-muted">in combat</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy || e.remaining <= 0}
                onClick={() => setRemaining(e.remaining - 1)}
                className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-lg border border-bdr bg-mid text-xl font-bold text-gold transition-colors hover:border-gold-dark disabled:opacity-40"
                aria-label="Decrease remaining creatures"
              >
                −
              </button>
              <button
                type="button"
                disabled={busy || e.remaining >= e.count}
                onClick={() => setRemaining(e.remaining + 1)}
                className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-lg border border-bdr bg-mid text-xl font-bold text-gold transition-colors hover:border-gold-dark disabled:opacity-40"
                aria-label="Increase remaining creatures"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {e.remaining === 0 ? (
          <p className="text-sm text-muted">No active creatures for this line — use + to bring one back.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: e.remaining }, (_, j) => {
              const instanceIndex = j;
              const slot = instancesAligned[instanceIndex] ?? { hp_current: null, effects: [] };
              return (
                <div key={instanceIndex} className="flex min-w-0 flex-col gap-3">
                  {e.statblock_state ? (
                    <div className="enc-session-sb-wrap min-w-0">
                      <StatBlockRenderer state={withSessionLabel(e.statblock_state, baseName, instanceIndex + 1)} />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-bdr bg-mid/30 p-4 text-center text-sm text-muted">
                      Stat block data unavailable.
                      <div className="mt-2 font-[var(--font-cinzel),serif] text-gold">
                        ({baseName} #{instanceIndex + 1})
                      </div>
                    </div>
                  )}
                  <InstancePanel
                    entryId={e.id}
                    instanceIndex={instanceIndex}
                    count={e.count}
                    slot={slot}
                    hpMaxHint={e.hp_max_hint}
                    busy={busy}
                    onPatch={onPatch}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end border-t border-bdr/80 pt-3">
          <button
            type="button"
            disabled={busy || atDefault}
            onClick={resetRow}
            className="panel-btn text-xs text-bronze disabled:opacity-40"
          >
            Reset row
          </button>
        </div>
      </div>
    </li>
  );
}
