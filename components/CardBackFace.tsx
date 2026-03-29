'use client';

import { forwardRef } from 'react';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';

interface Props {
  src: string;
}

/** Same outer dimensions as `.spell-card`; full-bleed image for reverse-face export. */
const CardBackFace = forwardRef<HTMLDivElement, Props>(function CardBackFace({ src }, ref) {
  return (
    <div ref={ref} className="spell-card">
      <img
        className="card-back-face-img"
        src={src}
        alt=""
        crossOrigin={crossOriginForImgSrc(src)}
      />
    </div>
  );
});

export default CardBackFace;
