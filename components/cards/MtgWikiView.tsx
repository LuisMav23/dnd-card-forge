'use client';

import { forwardRef } from 'react';
import type { MtgCardState, MtgColor } from '@/lib/mtgTypes';
import { MTG_CARD_TYPES, MTG_RARITIES, buildTypeLine } from '@/lib/mtgCardConfig';
import { ManaCostDisplay, RulesTextWithSymbols, parseManaString } from '@/components/MtgSymbol';
import MtgCardRenderer from '@/components/MtgCardRenderer';
import WikiClickableArt from '@/components/wiki/WikiClickableArt';
import { CARD_FONT_SCALE } from '@/lib/cardPalette';
import type { ImageAspect } from '@/lib/types';

interface Props {
  state: MtgCardState;
  savedTitle?: string;
}

const COLOR_LABELS: Record<MtgColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

function wikiArtFrameClass(imageAspect: ImageAspect | undefined): string {
  const a = imageAspect ?? 'square';
  if (a === 'landscape') return 'aspect-[559/256] w-full';
  if (a === 'portrait') return 'aspect-square w-full';
  return 'aspect-[3/2] w-full';
}

function rarityWikiLabel(key: MtgCardState['rarity']): string {
  return MTG_RARITIES.find(r => r.key === key)?.label ?? key;
}

const MtgWikiView = forwardRef<HTMLDivElement, Props>(function MtgWikiView(
  { state, savedTitle },
  ref
) {
  const typeCfg = MTG_CARD_TYPES[state.type];
  const name = state.name?.trim() || 'Untitled card';
  const typeLine = buildTypeLine(state);
  const hasMana = state.type !== 'land' || (state.manaCost && parseManaString(state.manaCost).length > 0);
  const fontScale = CARD_FONT_SCALE[state.fontSize ?? 'md'];
  const wikiSymSize = Math.max(12, Math.round(16 * fontScale));

  const detailRows: { label: string; value: string }[] = [];

  if (state.type === 'creature') {
    detailRows.push({
      label: 'Power / Toughness',
      value: `${state.power || '1'} / ${state.toughness || '1'}`,
    });
  }
  if (state.type === 'planeswalker') {
    detailRows.push({
      label: 'Starting loyalty',
      value: state.startingLoyalty || '—',
    });
    detailRows.push({
      label: 'Loyalty abilities',
      value: String(state.loyaltyAbilities?.length ?? 0),
    });
  }
  if (state.type === 'battle') {
    detailRows.push({ label: 'Defense', value: state.defense || '—' });
  }

  const colorStr =
    state.colors?.length > 0
      ? state.colors.map(c => COLOR_LABELS[c] ?? c).join(', ')
      : 'Colorless';

  detailRows.push({ label: 'Colors', value: colorStr });
  detailRows.push({ label: 'Set code', value: state.setCode?.trim() || '—' });
  detailRows.push({ label: 'Collector #', value: state.collectorNumber?.trim() || '—' });
  detailRows.push({ label: 'Artist', value: state.artistName?.trim() || '—' });

  const keywordsLine = state.keywords?.length ? state.keywords.join(', ') : '';

  return (
    <article className="wiki-card-page mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
      <div className="rounded-2xl border border-bdr bg-panel/90 p-7 shadow-sm sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <header className="space-y-4 pr-1">
              <p className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-dark">
                {typeCfg.label}
              </p>
              <h1 className="font-[var(--font-cinzel),serif] text-2xl font-bold tracking-wide text-gold sm:text-4xl">
                {name}
              </h1>
              {savedTitle && savedTitle.trim() !== name.trim() && (
                <p className="text-sm text-muted">Library title: {savedTitle}</p>
              )}
              <p className="text-sm leading-relaxed text-parch">{typeLine || '—'}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {hasMana && state.manaCost?.trim() ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-bdr bg-mid px-3 py-1.5 font-[var(--font-cinzel),serif] text-sm font-bold text-parch">
                    <ManaCostDisplay manaCost={state.manaCost} size={Math.max(16, Math.round(22 * fontScale))} />
                  </span>
                ) : null}
                <span className="text-sm text-muted">Rarity: {rarityWikiLabel(state.rarity)}</span>
              </div>
            </header>

            <WikiClickableArt
              src={state.image}
              alt={`${name} card art`}
              frameClassName={wikiArtFrameClass(state.imageAspect)}
              placeholder={<span aria-hidden>⬡</span>}
            />

            <section className="flex flex-col gap-4">
              <h2 className="border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Card preview
              </h2>
              <div className="overflow-hidden rounded-xl border border-bdr bg-prev px-3 py-6 sm:px-5 sm:py-8">
                <div className="mx-auto flex w-[290px] max-w-full justify-center">
                  <div className="mtg-card-scale-wrap">
                    <MtgCardRenderer ref={ref} state={state} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-12 lg:col-span-7">
            <section>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Rules text
              </h2>

              {state.type === 'planeswalker' ? (
                <ul className="space-y-4">
                  {(state.loyaltyAbilities ?? []).map((ab, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-bdr/70 bg-mid/30 px-4 py-3 text-sm text-parch"
                    >
                      <span className="mr-2 font-mono font-semibold text-gold">{ab.cost}</span>
                      <RulesTextWithSymbols text={ab.text?.trim() || '…'} symbolSize={wikiSymSize} />
                    </li>
                  ))}
                  {(!state.loyaltyAbilities || state.loyaltyAbilities.length === 0) && (
                    <p className="text-sm text-muted">No loyalty abilities.</p>
                  )}
                </ul>
              ) : state.type === 'saga' ? (
                <ul className="space-y-4">
                  {(state.sagaChapters ?? []).map((ch, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-bdr/70 bg-mid/30 px-4 py-3 text-sm text-parch"
                    >
                      <span className="mr-2 font-semibold text-gold">{ch.chapters}</span>
                      <RulesTextWithSymbols text={ch.text?.trim() || '…'} symbolSize={wikiSymSize} />
                    </li>
                  ))}
                  {(!state.sagaChapters || state.sagaChapters.length === 0) && (
                    <p className="text-sm text-muted">No saga chapters.</p>
                  )}
                </ul>
              ) : (
                <div className="space-y-3 text-sm leading-relaxed text-parch">
                  {keywordsLine ? (
                    <p className="italic text-parch/95">{keywordsLine}</p>
                  ) : null}
                  {state.rulesText?.trim() ? (
                    <RulesTextWithSymbols text={state.rulesText} symbolSize={wikiSymSize} />
                  ) : (
                    <p className="text-muted">No rules text.</p>
                  )}
                </div>
              )}

              {state.flavorText?.trim() ? (
                <blockquote className="mt-6 border-l-2 border-gold/50 pl-4 font-[Georgia,serif] text-base italic leading-relaxed text-bronze">
                  &ldquo;{state.flavorText.trim()}&rdquo;
                </blockquote>
              ) : null}
            </section>

            <section>
              <h2 className="mb-5 border-b border-bdr pb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Details
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {detailRows.map((row, i) => (
                  <div
                    key={`${row.label}-${i}`}
                    className="rounded-xl border border-bdr/80 bg-mid/50 px-4 py-4 sm:px-5"
                  >
                    <dt className="font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
                      {row.label}
                    </dt>
                    <dd className="mt-2 font-[var(--font-cinzel),serif] text-base font-semibold text-gold sm:text-lg">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
});

MtgWikiView.displayName = 'MtgWikiView';

export default MtgWikiView;
