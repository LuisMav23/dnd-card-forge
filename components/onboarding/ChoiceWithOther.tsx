'use client';

import { PRIMARY_USE_OPTIONS } from '@/lib/onboarding/types';
import { PRIMARY_USE_LABELS } from '@/lib/onboarding/presets';
import type { PrimaryUseOption } from '@/lib/onboarding/types';

type ChoiceWithOtherProps = {
  value: PrimaryUseOption | null;
  otherText: string | null;
  onValueChange: (v: PrimaryUseOption | null) => void;
  onOtherTextChange: (t: string | null) => void;
};

export default function ChoiceWithOther({
  value,
  otherText,
  onValueChange,
  onOtherTextChange,
}: ChoiceWithOtherProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-2">
        {PRIMARY_USE_OPTIONS.map(key => {
          const checked = value === key;
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                checked
                  ? 'border-gold-dark bg-gold/15 dark:border-gold'
                  : 'border-bdr bg-mid/70 hover:border-gold-dark/50 dark:bg-field-bg'
              }`}
            >
              <input
                type="radio"
                name="primaryUse"
                checked={checked}
                onChange={() => onValueChange(key)}
                className="mt-1 border-bdr text-gold-dark focus:ring-gold/30"
              />
              <span className="font-[var(--font-cinzel),serif] text-sm font-medium tracking-wide text-parch">
                {PRIMARY_USE_LABELS[key] ?? key}
              </span>
            </label>
          );
        })}
      </div>
      {value === 'other' && (
        <div className="mt-1 flex flex-col gap-1">
          <label
            htmlFor="primary-use-other"
            className="text-xs font-semibold uppercase tracking-wider text-gold-dark"
          >
            Describe (optional)
          </label>
          <textarea
            id="primary-use-other"
            rows={3}
            maxLength={500}
            value={otherText ?? ''}
            onChange={e => onOtherTextChange(e.target.value || null)}
            placeholder="What are you hoping to do?"
            className="rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/80 dark:bg-field-bg"
          />
        </div>
      )}
    </div>
  );
}
