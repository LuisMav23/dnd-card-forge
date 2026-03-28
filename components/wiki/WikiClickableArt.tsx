'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';

type Props = {
  src: string | null | undefined;
  /** Tailwind aspect + sizing classes for the frame (e.g. aspect-[559/256] w-full) */
  frameClassName: string;
  alt: string;
  placeholder: ReactNode;
};

export default function WikiClickableArt({ src, frameClassName, alt, placeholder }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const shellClass = `overflow-hidden rounded-xl border border-bdr bg-mid/40 shadow-inner ${frameClassName}`;

  if (!src?.trim()) {
    return (
      <div className={shellClass}>
        <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-mid/80 text-7xl">
          {placeholder}
        </div>
      </div>
    );
  }

  const url = src.trim();

  return (
    <>
      <div className={shellClass}>
        <button
          type="button"
          className="group relative flex h-full min-h-0 w-full cursor-zoom-in items-center justify-center overflow-hidden bg-mid/30 p-0 text-left outline-none transition-colors hover:bg-mid/50 focus-visible:ring-2 focus-visible:ring-gold/50"
          onClick={() => setOpen(true)}
          aria-label={`View full image: ${alt}`}
        >
          <img
            src={url}
            alt={alt}
            crossOrigin={crossOriginForImgSrc(url)}
            className="h-full w-full min-h-0 object-cover group-hover:object-contain group-focus-visible:object-contain"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/65 px-2 py-1 font-[var(--font-cinzel),serif] text-[0.6rem] font-semibold uppercase tracking-wider text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            View full
          </span>
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-ink/88 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Full image"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-md border border-bdr bg-panel px-3 py-2 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold shadow-lg hover:bg-mid sm:right-6 sm:top-6"
            onClick={e => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            Close
          </button>
          <img
            src={url}
            alt={alt}
            crossOrigin={crossOriginForImgSrc(url)}
            className="max-h-[min(92vh,1400px)] max-w-[min(96vw,1400px)] object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
