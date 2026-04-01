'use client';

import React, { forwardRef } from 'react';
import { CardState } from '@/lib/types';
import { CARD_TYPES, getTypebar, getCost } from '@/lib/cardConfig';
import { cardPaletteCssVars } from '@/lib/cardPalette';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';
import { GEMS, abilityMod } from '@/lib/utils';
import IconDisplay from '@/components/IconDisplay';

const CornerSVG = () => (
  <svg viewBox="0 0 20 20" aria-hidden>
    <path d="M0 20L0 0L20 0" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="0" cy="0" r="3.5" fill="currentColor" />
  </svg>
);

interface Props {
  state: CardState;
}

const CardRenderer = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const cfg = CARD_TYPES[state.type];
  const f = state.fields;
  const tb = getTypebar(state.type, f);
  const cost = getCost(state.type, f);
  const name = f.name || 'Card Name';
  const flavor = f.flavor || '';
  const desc = f.desc || 'Enter the card effect or description…';
  const cls = f.class || '';

  const stats = [0, 1, 2, 3]
    .map(i => ({ label: f[`sl${i}`], value: f[`sv${i}`] }))
    .filter(s => s.label && s.value);

  const artContent = state.image ? (
    <img src={state.image} alt="Card art" crossOrigin={crossOriginForImgSrc(state.image)} />
  ) : (
    <div className="c-art-ph"><IconDisplay iconId={state.icon} className="c-art-ph-icon" /></div>
  );

  const isSK = cfg.isSidekick;

  const bgBlock =
    state.backgroundTexture ? (
      <div className="card-bg card-bg--textured">
        <img
          className="card-bg-tex-img"
          src={state.backgroundTexture}
          alt=""
          crossOrigin={crossOriginForImgSrc(state.backgroundTexture)}
        />
        <div className="card-bg-tex-wash" aria-hidden />
      </div>
    ) : (
      <div className="card-bg" />
    );

  return (
    <div
      ref={ref}
      className="spell-card"
      style={cardPaletteCssVars(state)}
    >
      {bgBlock}
      <div className="card-border-o" />
      <div className="card-border-i" />
      <div className="corner ctlx">
        <CornerSVG />
      </div>
      <div className="corner ctrx">
        <CornerSVG />
      </div>
      <div className="corner cblx">
        <CornerSVG />
      </div>
      <div className="corner cbrx">
        <CornerSVG />
      </div>

      <div className="cz-header">
        <div className="c-name">{name}</div>
        <div className="c-cost-badge">
          {cost.value}
          <span className="cl">{cost.label}</span>
        </div>
      </div>

      {isSK ? (
        <>
          <div className="cz-portrait">{artContent}</div>
          <div className="cz-sk-stats">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(ab => (
              <div key={ab} className="sk-stat-row">
                <span className="sk-stat-key">{ab.toUpperCase()}</span>
                <span className="sk-stat-val">
                  {f[ab] || '10'} ({abilityMod(f[ab] || '10')})
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="cz-art">{artContent}</div>
      )}

      <div className="cz-typebar">
        <span className="c-type">{tb.left}</span>
        <span className="c-subtype">{tb.right}</span>
      </div>

      <div className="cz-text">
        {flavor && <div className="c-flavor">&ldquo;{flavor}&rdquo;</div>}
        <div className="c-desc" dangerouslySetInnerHTML={{ __html: desc }} />
      </div>

      {stats.length > 0 && (
        <div className="cz-stats">
          {stats.map((s, i) => (
            <div key={i} className="c-stat">
              <span className="c-stat-l">{s.label}</span>
              <span className="c-stat-v">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="cz-footer">
        <span className="c-class">{cls}</span>
        <span className="c-gems">{GEMS[state.rarity]}</span>
      </div>
    </div>
  );
});

CardRenderer.displayName = 'CardRenderer';

export default CardRenderer;
