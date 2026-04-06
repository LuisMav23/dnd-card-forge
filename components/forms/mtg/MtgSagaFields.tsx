'use client';

import { MtgCardState, MtgSagaChapter } from '@/lib/mtgTypes';

interface Props {
  state: MtgCardState;
  onChange: (key: keyof MtgCardState, value: unknown) => void;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const CHAPTER_COMBOS = ['I', 'II', 'III', 'IV', 'I, II', 'II, III', 'III, IV', 'I, II, III'];

export default function MtgSagaFields({ state, onChange }: Props) {
  const chapters = state.sagaChapters;

  function updateChapter(index: number, field: keyof MtgSagaChapter, value: string) {
    const updated = chapters.map((ch, i) =>
      i === index ? { ...ch, [field]: value } : ch
    );
    onChange('sagaChapters', updated);
  }

  function addChapter() {
    const nextNum = ROMAN_NUMERALS[chapters.length] ?? 'IV';
    onChange('sagaChapters', [...chapters, { chapters: nextNum, text: '' }]);
  }

  function removeChapter(index: number) {
    onChange('sagaChapters', chapters.filter((_, i) => i !== index));
  }

  return (
    <div className="fsec">
      <h3>Saga Chapters</h3>
      <p className="mb-3 text-xs text-muted">
        Each chapter triggers when a lore counter equal to its number is placed on the Saga.
      </p>

      <div className="flex flex-col gap-3">
        {chapters.map((chapter, i) => (
          <div key={i} className="rounded border border-bdr-2 bg-field-bg/30 p-3">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-xs text-muted shrink-0 w-14">Chapter(s)</label>
              <select
                value={chapter.chapters}
                onChange={e => updateChapter(i, 'chapters', e.target.value)}
                className="flex-1"
              >
                {CHAPTER_COMBOS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={chapter.chapters}
                onChange={e => updateChapter(i, 'chapters', e.target.value)}
                placeholder="I"
                className="w-16"
              />
              <button
                type="button"
                onClick={() => removeChapter(i)}
                className="ml-auto text-xs text-muted hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="fg">
              <label className="text-xs text-muted">Chapter ability</label>
              <textarea
                value={chapter.text}
                onChange={e => updateChapter(i, 'text', e.target.value)}
                rows={2}
                placeholder="What happens when this chapter triggers…"
              />
            </div>
          </div>
        ))}
      </div>

      {chapters.length < 6 && (
        <button
          type="button"
          onClick={addChapter}
          className="mt-3 w-full rounded border border-dashed border-bdr-2 bg-panel/40 py-2 text-xs text-muted transition-all hover:border-gold/40 hover:text-bronze"
        >
          + Add Chapter
        </button>
      )}

      <div className="mt-3 rounded border border-bdr-2 bg-panel/60 px-3 py-2 text-xs text-muted">
        <strong className="text-bronze">Saga tip:</strong> After the final chapter resolves, the Saga is sacrificed.
        Use lore counters (I, II, III…) as chapter identifiers.
      </div>
    </div>
  );
}
