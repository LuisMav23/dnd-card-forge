'use client';

import { forwardRef, type LegacyRef, type RefObject } from 'react';
import { CardState } from '@/lib/types';
import { CARD_TYPES, getTypebar, getCost } from '@/lib/cardConfig';
import { abilityMod, GEMS } from '@/lib/utils';
import { getCardWikiCardExtras, getCardWikiFeatureRows } from '@/lib/cardWikiMetadata';
import CardBackFace from '@/components/CardBackFace';
import CardRenderer from '@/components/CardRenderer';
import WikiClickableArt from '@/components/wiki/WikiClickableArt';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  state: CardState;
  savedTitle?: string;
  /** When set, a hidden full-size back face is mounted for PNG export. */
  backExportRef?: RefObject<HTMLDivElement | null>;
}

function rarityLabel(r: string): string {
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : r;
}

const CardWikiView = forwardRef<HTMLDivElement, Props>(function CardWikiView(
  { state, savedTitle, backExportRef },
  ref
) {
  const cfg = CARD_TYPES[state.type];
  const f = state.fields;
  const tb = getTypebar(state.type, f);
  const cost = getCost(state.type, f);
  const name = f.name || 'Untitled card';
  const stats = [0, 1, 2, 3]
    .map(i => ({ label: f[`sl${i}`], value: f[`sv${i}`] }))
    .filter(s => s.label?.trim() && s.value?.trim());

  const featureRows = getCardWikiFeatureRows(state.type, f);
  const cardExtra = getCardWikiCardExtras(f);

  return (
    <article className="wiki-card-page mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
      <div className="rounded-2xl border border-bdr bg-panel/90 p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <header className="space-y-4 pr-1">
              <p className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                {cfg.label}
              </p>
              <h1 className="font-[var(--font-cinzel),serif] text-2xl font-bold tracking-wide text-gold sm:text-4xl">
                {name}
              </h1>
              {savedTitle && savedTitle.trim() !== name.trim() && (
                <p className="text-sm text-muted">Library title: {savedTitle}</p>
              )}
              <p className="text-sm leading-relaxed text-parch">{tb.left}</p>
              <p className="text-xs uppercase tracking-wider text-muted">{tb.right}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-baseline gap-1.5 rounded-md border border-bdr bg-mid px-3 py-1.5 font-[var(--font-cinzel),serif] text-sm font-bold text-parch">
                  <span>{cost.value}</span>
                  {cost.label ? (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
                      {cost.label}
                    </span>
                  ) : null}
                </span>
                <span className="text-sm text-muted">Rarity: {rarityLabel(state.rarity)}</span>
                {state.showPips !== false ? (
                  <span className="text-lg tracking-widest text-gold" aria-hidden>
                    {GEMS[state.rarity]}
                  </span>
                ) : null}
              </div>
            </header>
            <WikiClickableArt
              src={state.image}
              alt={`${name} card art`}
              frameClassName="aspect-[559/256] w-full"
              placeholder={<span aria-hidden>{state.icon}</span>}
            />

            <section className="flex flex-col gap-4">
              <h2 className="border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Card preview
              </h2>
              <div className="overflow-hidden rounded-xl border border-bdr bg-prev px-3 py-6 sm:px-5 sm:py-8">
                <div className="mx-auto flex w-[290px] max-w-full justify-center">
                  <div className="card-scale-wrap">
                    <CardRenderer ref={ref} state={state} />
                  </div>
                </div>
              </div>
            </section>

            {state.backImage ? (
              <section className="flex flex-col gap-4">
                <h2 className="border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Card back
                </h2>
                <div className="overflow-hidden rounded-xl border border-bdr bg-prev px-3 py-6 sm:px-5 sm:py-8">
                  <div className="mx-auto flex w-[290px] max-w-full justify-center">
                    <div className="card-scale-wrap">
                      <CardBackFace src={state.backImage} />
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <div className="flex flex-col gap-12 lg:col-span-7">
            <div>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Statistics
              </h2>
              {stats.length === 0 ? (
                <p className="text-sm text-muted">No stat blocks defined.</p>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-bdr/80 bg-mid/50 px-4 py-4 sm:px-5"
                    >
                      <dt className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                        {s.label}
                      </dt>
                      <dd className="mt-2 font-[var(--font-cinzel),serif] text-lg font-semibold text-gold sm:text-xl">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {state.type === 'sidekick' && (
                <div className="mt-10">
                  <h3 className="mb-4 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                    Ability scores
                  </h3>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(ab => (
                      <div
                        key={ab}
                        className="rounded-md border border-bdr/60 bg-panel/80 px-3 py-2 text-center"
                      >
                        <dt className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
                          {ab}
                        </dt>
                        <dd className="text-sm font-semibold text-parch">
                          {f[ab] || '10'} ({abilityMod(f[ab] || '10')})
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <section>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Description
              </h2>
              {f.flavor?.trim() ? (
                <blockquote className="mb-6 border-l-2 border-gold/50 pl-4 font-[Georgia,serif] text-base italic leading-relaxed text-bronze">
                  &ldquo;{f.flavor.trim()}&rdquo;
                </blockquote>
              ) : null}
              <div
                className="wiki-card-desc text-sm leading-relaxed text-parch [&_p]:mb-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(f.desc?.trim() ? f.desc : '<p class="text-muted">No description.</p>'),
                }}
              />
            </section>

            <section>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Features and additional information
              </h2>
              {featureRows.length === 0 ? (
                <p className="text-sm text-muted">No extra properties beyond the summary above.</p>
              ) : (
                <dl className="space-y-4">
                  {featureRows.map((row, i) => (
                    <div
                      key={`${row.label}-${i}`}
                      className="flex flex-col gap-2 rounded-xl border border-bdr/70 bg-mid/30 px-4 py-3.5 sm:flex-row sm:gap-6"
                    >
                      <dt className="shrink-0 font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider text-gold-dark sm:w-44">
                        {row.label}
                      </dt>
                      <dd className="text-sm text-parch">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {cardExtra && (
                <div className="mt-8">
                  <h3 className="mb-3 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">
                    Card
                  </h3>
                  <dl>
                    <div className="rounded-lg border border-bdr/70 bg-mid/30 px-4 py-3">
                      <dt className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider text-gold-dark">
                        {cardExtra.label}
                      </dt>
                      <dd className="mt-1 text-sm text-parch">{cardExtra.value}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      {state.backImage && backExportRef ? (
        <div
          className="pointer-events-none fixed left-[-10000px] top-0 h-[833px] w-[595px] overflow-visible"
          aria-hidden
        >
          <CardBackFace ref={backExportRef as LegacyRef<HTMLDivElement>} src={state.backImage} />
        </div>
      ) : null}
    </article>
  );
});

CardWikiView.displayName = 'CardWikiView';

export default CardWikiView;
