'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkle } from 'lucide-react';
import { GameSystem, StatBlockType, StatBlockState } from '@/lib/statblockTypes';
import {
  STATBLOCK_TYPES,
  SYSTEM_TYPE_ORDER,
  getDefaultStatBlockFields,
  getDefaultFeatures,
} from '@/lib/statblockConfig';
import { paletteFromStatBlockDefaultTheme } from '@/lib/statBlockPalette';
import StatBlockRenderer from '@/components/statblocks/StatBlockRenderer';
import IconDisplay from '@/components/IconDisplay';

const SYSTEM_LABELS: Record<GameSystem, { label: string; sub: string }> = {
  daggerheart: { label: 'Daggerheart', sub: 'Darrington Press · 2024' },
  dnd: { label: 'D&D 5e', sub: 'Wizards of the Coast · 2014' },
};

const TYPE_DESCRIPTIONS: Record<StatBlockType, string> = {
  adversary: 'A hostile creature or villain the party must fight or overcome.',
  npc: 'A non-player character with a role, personality, and motivations.',
  environment: 'A location or scenario that acts as a living, breathing obstacle.',
};

function buildSBPreviewState(system: GameSystem, type: StatBlockType): StatBlockState {
  const cfg = STATBLOCK_TYPES[type];
  const fields = getDefaultStatBlockFields(system, type);
  const nameMap: Record<GameSystem, Record<StatBlockType, string>> = {
    daggerheart: { adversary: 'Shadow Drake', npc: 'Village Elder', environment: 'The Cursed Wood' },
    dnd: { adversary: 'Cave Troll', npc: 'Town Guard', environment: 'Haunted Crypt' },
  };
  return {
    system,
    type,
    ...paletteFromStatBlockDefaultTheme(cfg.defaultTheme),
    icon: cfg.defaultIcon,
    image: null,
    fields: { ...fields, name: nameMap[system][type] },
    features: getDefaultFeatures(system, type),
  };
}

/** Matches `.sb-card` width in globals.css. */
const SB_CARD_LAYOUT_WIDTH = 700;
/** Same visual scale as `.sb-scale-wrap` default (0.39). */
const SB_PICKER_SCALE = 0.39;

/**
 * Stat blocks are 700px wide; we scale for the picker. `transform: scale()` does not
 * shrink layout, so `.sb-scale-wrap` uses a fixed negative margin — wrong for variable
 * heights (huge empty gap). This wrapper clips to the real scaled box.
 */
function PickerStatBlockScaledPreview({ state }: { state: StatBlockState }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(720);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setContentH(Math.max(el.offsetHeight, 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state]);

  const scaledW = SB_CARD_LAYOUT_WIDTH * SB_PICKER_SCALE;
  const scaledH = contentH * SB_PICKER_SCALE;

  return (
    <div
      className="mx-auto max-w-full overflow-hidden"
      style={{ width: scaledW, height: scaledH }}
    >
      <div
        ref={innerRef}
        style={{
          width: SB_CARD_LAYOUT_WIDTH,
          transform: `scale(${SB_PICKER_SCALE})`,
          transformOrigin: 'top left',
        }}
      >
        <StatBlockRenderer state={state} />
      </div>
    </div>
  );
}

export default function StatBlockTypePicker() {
  const router = useRouter();
  const [system, setSystem] = useState<GameSystem>('daggerheart');
  const [selectedType, setSelectedType] = useState<StatBlockType>('adversary');

  const typeOrder = SYSTEM_TYPE_ORDER[system];
  const selectedEntry = typeOrder.find(t => t.type === selectedType) ?? typeOrder[0];

  const previewState = useMemo(
    () => buildSBPreviewState(system, selectedType),
    [system, selectedType]
  );

  function handleCreate() {
    router.push(`/statblocks/new?system=${system}&type=${selectedType}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-2">
        <Link
          href="/statblocks"
          className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
        >
          ← All stat blocks
        </Link>
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          {/* Preview — top on narrow screens, right on xl (same pattern as CardTypePicker) */}
          <aside className="order-1 flex w-full flex-col items-center rounded-xl border border-bdr bg-prev/80 p-4 xl:order-2 xl:sticky xl:top-6 xl:w-[min(100%,300px)] xl:shrink-0 xl:border-l xl:border-t-0">
            <div className="flex w-full max-w-[280px] flex-col items-center">
              <span className="prev-label mb-2 w-full">
                <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Preview{' '}
                <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
              </span>
              <PickerStatBlockScaledPreview state={previewState} />
              <p className="prev-note mt-2 text-center">
                Updates when you change game system or type
              </p>
            </div>
          </aside>

          <div className="order-2 min-w-0 flex-1 xl:order-1">
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
              Step 1 — Choose a template
            </p>
            <h1 className="mt-1 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold">
              Stat Blocks
            </h1>
            <p className="mt-1 text-sm text-bronze">
              Pick a system and type — the preview shows the layout you will edit.
            </p>

            {/* Game system */}
            <div className="mt-8">
              <p className="mb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
                Game system
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {(['daggerheart', 'dnd'] as GameSystem[]).map(sys => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => {
                      setSystem(sys);
                      setSelectedType('adversary');
                    }}
                    className={[
                      'flex flex-col items-start rounded border px-5 py-3 text-left transition-all duration-150 sm:min-w-[200px]',
                      system === sys
                        ? 'border-gold bg-panel text-gold shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                        : 'border-bdr bg-panel/40 text-bronze hover:border-gold/40 hover:bg-panel',
                    ].join(' ')}
                  >
                    <span className="font-[var(--font-cinzel),serif] text-sm font-bold uppercase tracking-wide">
                      {SYSTEM_LABELS[sys].label}
                    </span>
                    <span className="text-xs text-muted">{SYSTEM_LABELS[sys].sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type — icon + label only (no embedded mini previews) */}
            <div className="mt-8">
              <p className="mb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
                Type
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {typeOrder.map(({ type, label, iconId }) => {
                  const isActive = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={[
                        'group flex flex-row items-center gap-3 rounded border-2 px-4 py-3 text-left transition-all duration-150',
                        'bg-panel/60 hover:bg-panel',
                        isActive
                          ? 'border-gold shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                          : 'border-bdr hover:border-gold/40',
                      ].join(' ')}
                    >
                      <IconDisplay
                        iconId={iconId}
                        className={[
                          'h-9 w-9 shrink-0 opacity-80',
                          isActive ? 'text-gold' : 'text-bronze group-hover:text-gold',
                        ].join(' ')}
                      />
                      <span
                        className={[
                          'font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider',
                          isActive ? 'text-gold' : 'text-bronze group-hover:text-gold',
                        ].join(' ')}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 min-h-[1.5rem] text-sm text-muted">
              <span className="font-semibold text-bronze">{selectedEntry.label}:</span>{' '}
              {TYPE_DESCRIPTIONS[selectedType]}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-end gap-4 border-t border-bdr pt-6">
              <Link href="/statblocks" className="panel-btn text-sm text-muted">
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleCreate}
                className="panel-btn text-sm text-gold hover:border-gold"
              >
                Create {selectedEntry.label} →
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
