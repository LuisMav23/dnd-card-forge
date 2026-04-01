'use client';

import type { LegacyRef, RefObject } from 'react';
import { Sparkle } from 'lucide-react';
import { CardState } from '@/lib/types';
import CardRenderer from './CardRenderer';
import CardBackFace from './CardBackFace';

export type CardPreviewFace = 'front' | 'back';

interface Props {
  state: CardState;
  previewFace: CardPreviewFace;
  onPreviewFaceChange: (face: CardPreviewFace) => void;
  frontExportRef: RefObject<HTMLDivElement | null>;
  backExportRef: RefObject<HTMLDivElement | null>;
}

export default function LivePreview({
  state,
  previewFace,
  onPreviewFaceChange,
  frontExportRef,
  backExportRef,
}: Props) {
  const hasBack = Boolean(state.backImage);

  return (
    <div className="prev-panel">
      <span className="prev-label"><Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Live Preview <Sparkle className="inline-block h-3 w-3 align-[-1px]" /></span>
      <div
        className="mb-2 flex justify-center gap-1"
        role="tablist"
        aria-label="Card face"
      >
        <button
          type="button"
          role="tab"
          aria-selected={previewFace === 'front'}
          className={`rounded-md border px-3 py-1.5 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider transition-colors ${
            previewFace === 'front'
              ? 'border-gold-dark bg-mid text-gold-dark dark:border-gold dark:text-gold'
              : 'border-bdr bg-panel/80 text-muted hover:border-gold-dark/50 hover:text-ink dark:hover:text-bronze'
          }`}
          onClick={() => onPreviewFaceChange('front')}
        >
          Front
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={previewFace === 'back'}
          disabled={!hasBack}
          className={`rounded-md border px-3 py-1.5 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            previewFace === 'back'
              ? 'border-gold-dark bg-mid text-gold-dark dark:border-gold dark:text-gold'
              : 'border-bdr bg-panel/80 text-muted hover:border-gold-dark/50 hover:text-ink dark:hover:text-bronze'
          }`}
          onClick={() => hasBack && onPreviewFaceChange('back')}
        >
          Back
        </button>
      </div>
      <div className="card-scale-wrap relative flex justify-center">
        <div
          className={
            previewFace === 'front'
              ? 'relative z-[1]'
              : 'pointer-events-none invisible absolute inset-0 z-0 flex justify-center'
          }
          aria-hidden={previewFace !== 'front'}
        >
          <CardRenderer ref={frontExportRef as LegacyRef<HTMLDivElement>} state={state} />
        </div>
        {hasBack && state.backImage ? (
          <div
            className={
              previewFace === 'back'
                ? 'relative z-[1]'
                : 'pointer-events-none invisible absolute inset-0 z-0 flex justify-center'
            }
            aria-hidden={previewFace !== 'back'}
          >
            <CardBackFace ref={backExportRef as LegacyRef<HTMLDivElement>} src={state.backImage} />
          </div>
        ) : null}
      </div>
      {!hasBack && previewFace === 'front' ? (
        <p className="prev-note text-[0.68rem]">Upload a card back image below to preview the reverse side.</p>
      ) : previewFace === 'back' ? (
        <p className="prev-note">Reverse face for print (export includes a second PNG).</p>
      ) : (
        <p className="prev-note">Updates instantly as you type</p>
      )}
    </div>
  );
}
