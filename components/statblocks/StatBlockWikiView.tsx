'use client';

import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ForwardedRef,
  type MutableRefObject,
  type Ref,
} from 'react';
import type { StatBlockState } from '@/lib/statblockTypes';
import {
  getStatBlockWikiNarrativeSections,
  getStatBlockWikiPrimaryStats,
  getStatBlockWikiSubtypeLine,
  getStatBlockWikiSystemLabel,
  getStatBlockWikiTypeLabel,
} from '@/lib/statBlockWikiContent';
import StatBlockRenderer from '@/components/statblocks/StatBlockRenderer';

const WIKI_SB_SCALE = 0.39;
const SB_CARD_LAYOUT_WIDTH = 700;

function assignDomRef<T>(r: Ref<T> | null | undefined, node: T | null) {
  if (r == null) return;
  if (typeof r === 'function') r(node);
  else (r as MutableRefObject<T | null>).current = node;
}

interface Props {
  state: StatBlockState;
  savedTitle?: string;
}

/** Scaled preview with viewport sized to scaled bounds so the full block is visible (avoids clipping from overflow + transform layout mismatch). */
function StatBlockWikiScaledPreview({
  state,
  exportRef,
}: {
  state: StatBlockState;
  exportRef: ForwardedRef<HTMLDivElement>;
}) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const setCardNode = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      assignDomRef(exportRef, node);
    },
    [exportRef]
  );

  const [naturalH, setNaturalH] = useState(0);

  useLayoutEffect(() => {
    const el = localRef.current;
    if (!el) return;
    const measure = () => setNaturalH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state]);

  const scaledW = Math.round(SB_CARD_LAYOUT_WIDTH * WIKI_SB_SCALE);
  const scaledH = naturalH > 0 ? Math.ceil(naturalH * WIKI_SB_SCALE) : Math.ceil(480 * WIKI_SB_SCALE);

  return (
    <div className="rounded-xl border border-bdr bg-prev px-3 py-6 sm:px-5 sm:py-8">
      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-md border border-bdr/40 bg-mid/20 shadow-inner"
          style={{ width: scaledW, height: scaledH }}
        >
          <div
            style={{
              transform: `scale(${WIKI_SB_SCALE})`,
              transformOrigin: 'top left',
              width: SB_CARD_LAYOUT_WIDTH,
            }}
          >
            <StatBlockRenderer ref={setCardNode} state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBlockWikiView = forwardRef<HTMLDivElement, Props>(function StatBlockWikiView(
  { state, savedTitle },
  ref
) {
  const f = state.fields;
  const name = f.name || 'Untitled stat block';
  const stats = getStatBlockWikiPrimaryStats(state);
  const narratives = getStatBlockWikiNarrativeSections(state);
  const desc = f.description?.trim();

  const artContent = state.image ? (
    <img src={state.image} alt="" className="h-full min-h-[220px] w-full object-cover" />
  ) : (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-mid/80 text-7xl">
      {state.icon}
    </div>
  );

  return (
    <article className="wiki-card-page mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
      <div className="rounded-2xl border border-bdr bg-panel/90 p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <header className="space-y-4 pr-1">
              <p className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                {getStatBlockWikiSystemLabel(state.system)} · {getStatBlockWikiTypeLabel(state)}
              </p>
              <h1 className="font-[var(--font-cinzel),serif] text-2xl font-bold tracking-wide text-gold sm:text-4xl">
                {name}
              </h1>
              {savedTitle && savedTitle.trim() !== name.trim() && (
                <p className="text-sm text-muted">Library title: {savedTitle}</p>
              )}
              <p className="text-base leading-relaxed text-parch">{getStatBlockWikiSubtypeLine(state)}</p>
            </header>
            <div className="overflow-hidden rounded-xl border border-bdr bg-mid/40 shadow-inner">
              <div className="aspect-[4/5] max-h-[min(420px,55vh)] w-full">{artContent}</div>
            </div>

            <section className="flex flex-col gap-4">
              <h2 className="border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Stat block preview
              </h2>
              <StatBlockWikiScaledPreview state={state} exportRef={ref} />
            </section>
          </div>

          <div className="flex flex-col gap-12 lg:col-span-7">
            <div>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Statistics
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {stats.map((row, i) => (
                  <div
                    key={`${row.label}-${i}`}
                    className="rounded-xl border border-bdr bg-mid/30 px-4 py-4 sm:px-5 sm:py-4"
                  >
                    <dt className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      {row.label}
                    </dt>
                    <dd className="mt-2 font-[var(--font-cinzel),serif] text-lg font-semibold leading-snug text-gold sm:text-xl">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {desc && (
              <section>
                <h2 className="mb-4 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Description
                </h2>
                <blockquote className="border-l-2 border-gold-dark/60 pl-4 text-sm italic leading-relaxed text-parch">
                  &ldquo;{desc}&rdquo;
                </blockquote>
              </section>
            )}

            {narratives.map(sec => (
              <section key={sec.title}>
                <h2 className="mb-4 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  {sec.title}
                </h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-parch sm:text-base sm:leading-relaxed">
                  {sec.body}
                </div>
              </section>
            ))}

            {state.features.length > 0 && (
              <section>
                <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Features
                </h2>
                <ul className="space-y-4">
                  {state.features.map(feat => (
                    <li
                      key={feat.id}
                      className="rounded-xl border border-bdr bg-mid/25 px-4 py-3.5 text-sm leading-relaxed text-parch"
                    >
                      <span
                        className={`mr-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded font-[var(--font-cinzel),serif] text-[0.65rem] font-bold uppercase ${
                          feat.kind === 'action'
                            ? 'bg-gold-dark/30 text-gold'
                            : feat.kind === 'reaction'
                              ? 'bg-red-900/40 text-red-200'
                              : 'bg-mid text-muted'
                        }`}
                      >
                        {feat.kind === 'action' ? 'A' : feat.kind === 'reaction' ? 'R' : 'P'}
                      </span>
                      <span className="font-semibold text-gold">{feat.name || 'Unnamed'}</span>
                      {feat.description ? (
                        <span className="text-muted"> — {feat.description}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

StatBlockWikiView.displayName = 'StatBlockWikiView';

export default StatBlockWikiView;
