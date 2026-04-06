'use client';

import React, { forwardRef } from 'react';
import { MtgCardState } from '@/lib/mtgTypes';
import { MTG_FRAME_PALETTES, MTG_RARITIES, buildTypeLine } from '@/lib/mtgCardConfig';
import { ManaCostDisplay, RulesTextWithSymbols, parseManaString } from '@/components/MtgSymbol';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';
import { CARD_FONT_SCALE } from '@/lib/cardPalette';

interface Props {
  state: MtgCardState;
}

function getRarityColor(rarity: MtgCardState['rarity']): string {
  const found = MTG_RARITIES.find(r => r.key === rarity);
  return found?.symbolColor ?? '#a58e4a';
}

function getRarityLabel(rarity: MtgCardState['rarity']): string {
  const map: Record<MtgCardState['rarity'], string> = {
    common: 'C',
    uncommon: 'U',
    rare: 'R',
    mythic: 'M',
  };
  return map[rarity] ?? 'R';
}

function getLoyaltyCostClass(cost: string): string {
  if (cost.startsWith('+')) return 'mtg-loyalty-cost';
  if (cost.startsWith('−') || cost.startsWith('-') || cost.startsWith('–')) return 'mtg-loyalty-cost minus';
  return 'mtg-loyalty-cost zero';
}

/** Same ratios as DnD `CardRenderer` art frame. */
function artAspectRatio(imageAspect: MtgCardState['imageAspect'] | undefined): string {
  const a = imageAspect ?? 'square';
  if (a === 'landscape') return '559 / 256';
  if (a === 'portrait') return '1 / 1';
  return '3 / 2';
}

const MtgCardRenderer = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const palette = state.customFramePalette ?? MTG_FRAME_PALETTES[state.frameColor];
  const typeLine = buildTypeLine(state);
  const hasMana = state.manaCost && parseManaString(state.manaCost).length > 0;
  const fontScale = CARD_FONT_SCALE[state.fontSize ?? 'md'];
  const aspectRatio = artAspectRatio(state.imageAspect);
  const cfg = {
    hasManaCost: state.type !== 'land' || hasMana,
    hasPT: state.type === 'creature',
    hasLoyalty: state.type === 'planeswalker',
    hasDefense: state.type === 'battle',
    hasSaga: state.type === 'saga',
  };

  const cssVars = {
    '--mtg-frame-top': palette.frameTop,
    '--mtg-frame-bottom': palette.frameBottom,
    '--mtg-textbox-bg': palette.textBoxBg,
    '--mtg-name-bg': palette.nameBg,
    '--mtg-border-color': palette.borderColor,
    '--mtg-text-color': palette.textColor,
    '--mtg-rarity-color': getRarityColor(state.rarity),
    '--mtg-font-scale': String(fontScale),
  } as React.CSSProperties;

  const keywordsLine = state.keywords.length > 0 ? state.keywords.join(', ') : '';
  const manaSymSize = Math.max(14, Math.round(22 * fontScale));
  const rulesSymBase = Math.max(11, Math.round(14 * fontScale));
  const sagaSymSize = Math.max(11, Math.round(13 * fontScale));

  return (
    <div ref={ref} className="mtg-card" style={cssVars}>
      {/* Outer metallic border */}
      <div className="mtg-card-border" />

      {/* Frame */}
      <div className="mtg-card-frame">
        <div className="mtg-frame-gradient" />

        {/* Name bar */}
        <div className="mtg-name-bar">
          <span className="mtg-card-name">{state.name || 'Card Name'}</span>
          {hasMana && (
            <span className="mtg-mana-cost-row">
              <ManaCostDisplay manaCost={state.manaCost} size={manaSymSize} />
            </span>
          )}
        </div>

        {/* Art box — aspect matches RPG “picture shape” (default 3:2 standard) */}
        <div className="mtg-art-box" style={{ aspectRatio }}>
          {state.image ? (
            <img
              src={state.image}
              alt="Card art"
              crossOrigin={crossOriginForImgSrc(state.image)}
            />
          ) : (
            <div className="mtg-art-placeholder">⬡</div>
          )}
        </div>

        {/* Type line */}
        <div className="mtg-type-line">
          <span className="mtg-type-text">{typeLine || 'Card Type'}</span>
          <span
            className="mtg-set-symbol"
            style={{ background: getRarityColor(state.rarity) }}
            title={`${state.rarity} — ${state.setCode}`}
          >
            {getRarityLabel(state.rarity)}
          </span>
        </div>

        {/* Text box */}
        <div className="mtg-text-box">
          {/* Planeswalker: loyalty abilities instead of rules text */}
          {cfg.hasLoyalty ? (
            <div className="mtg-loyalty-abilities">
              {state.loyaltyAbilities.map((ability, i) => (
                <div key={i} className="mtg-loyalty-ability">
                  <span className={getLoyaltyCostClass(ability.cost)}>{ability.cost}</span>
                  <span className="mtg-loyalty-ability-text">
                    <RulesTextWithSymbols text={ability.text || '…'} symbolSize={sagaSymSize} />
                  </span>
                </div>
              ))}
            </div>
          ) : cfg.hasSaga ? (
            /* Saga chapters */
            <div className="mtg-saga-chapters">
              {state.sagaChapters.map((chapter, i) => (
                <div key={i} className="mtg-saga-chapter">
                  <span className="mtg-saga-chapter-num">{chapter.chapters}</span>
                  <span className="mtg-saga-chapter-text">
                    <RulesTextWithSymbols text={chapter.text || '…'} symbolSize={sagaSymSize} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Standard rules text */
            <div className="mtg-rules-text">
              {keywordsLine && (
                <p style={{ fontStyle: 'italic', marginBottom: 4 }}>{keywordsLine}</p>
              )}
              <RulesTextWithSymbols
                text={state.rulesText || ''}
                symbolSize={rulesSymBase}
              />
            </div>
          )}

          {/* Flavor text */}
          {state.flavorText && (
            <div className="mtg-flavor-text">
              &ldquo;{state.flavorText}&rdquo;
            </div>
          )}

          {/* P/T box */}
          {cfg.hasPT && (
            <div className="mtg-pt-box">
              {state.power || '1'}/{state.toughness || '1'}
            </div>
          )}

          {/* Defense counter */}
          {cfg.hasDefense && (
            <div className="mtg-defense-box">
              {state.defense || '6'}
            </div>
          )}
        </div>

        {/* Card footer */}
        <div className="mtg-card-footer">
          <span className="mtg-footer-left">
            {state.setCode || 'CFG'} · {state.collectorNumber || '001'}
          </span>
          <span className="mtg-footer-right">
            {state.artistName ? `Illus. ${state.artistName}` : ''}
          </span>
        </div>

        {/* Planeswalker loyalty counter */}
        {cfg.hasLoyalty && state.startingLoyalty && (
          <div className="mtg-loyalty-badge">{state.startingLoyalty}</div>
        )}
      </div>
    </div>
  );
});

MtgCardRenderer.displayName = 'MtgCardRenderer';

export default MtgCardRenderer;
