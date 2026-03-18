'use client';

import { forwardRef } from 'react';
import { CardState } from '@/lib/types';
import CardRenderer from './CardRenderer';

interface Props {
  state: CardState;
}

const LivePreview = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  return (
    <div className="prev-panel">
      <span className="prev-label">✦ Live Preview ✦</span>
      <div className="card-scale-wrap">
        <CardRenderer ref={ref} state={state} />
      </div>
      <p className="prev-note">Updates instantly as you type</p>
    </div>
  );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;
