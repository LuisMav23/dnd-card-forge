'use client';

import { forwardRef } from 'react';
import { StatBlockState } from '@/lib/statblockTypes';
import StatBlockRenderer from './StatBlockRenderer';

interface Props {
  state: StatBlockState;
}

const StatBlockPreview = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  return (
    <div className="prev-panel sb-prev-panel">
      <span className="prev-label">✦ Live Preview ✦</span>
      <div className="sb-scale-wrap">
        <StatBlockRenderer ref={ref} state={state} />
      </div>
      <p className="prev-note">Updates instantly as you type</p>
    </div>
  );
});

StatBlockPreview.displayName = 'StatBlockPreview';

export default StatBlockPreview;
