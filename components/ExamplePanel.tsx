'use client';

import { useState } from 'react';
import { CardState } from '@/lib/types';
import CardRenderer from './CardRenderer';

interface Props {
  state: CardState;
}

export default function ExamplePanel({ state }: Props) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <button
        className="show-ex-btn"
        onClick={() => setHidden(false)}
      >
        Show Example
      </button>
    );
  }

  return (
    <div className="ex-panel">
      <div className="ex-hdr">
        <h3>📖 Example & Legend</h3>
        <button className="btn-sm" onClick={() => setHidden(true)}>Hide ✕</button>
      </div>
      <div className="ex-body">
        <p className="ex-note">Example mirrors your card live. Use it as layout reference.</p>
        <div className="ex-card-scale">
          <CardRenderer state={state} />
        </div>
        <div className="ex-legend">
          <b>CARD ANATOMY</b><br />
          🔵 Top Left — Card Name<br />
          🔵 Top Right — Cost / Slot / CR<br />
          🔵 Art Frame — Image or icon<br />
          🔵 Type Bar — Category · Subtype<br />
          🔵 Text Box — Flavor + Effect<br />
          🔵 Stat Pips — Key numbers (×4)<br />
          🔵 Border Color — Rarity tier<br />
          🔵 Bottom — Class / Source<br />
          🔵 Gems — ◇ Common → ◈ Artifact
        </div>
      </div>
    </div>
  );
}
