'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkle } from 'lucide-react';
import { CardType, ImageAspect, CardFontSize } from '@/lib/types';
import { CARD_TYPE_ORDER, CARD_TYPES, getDefaultFields } from '@/lib/cardConfig';
import { DEFAULT_CARD_PALETTE } from '@/lib/cardPalette';
import CardRenderer from '@/components/CardRenderer';
import IconDisplay from '@/components/IconDisplay';

const TYPE_DESCRIPTIONS: Record<CardType, string> = {
  spell: 'Arcane, divine, and natural magic — offensive, defensive, or utility.',
  armor: 'Protective gear from leather to plate. Shields and magical coverings.',
  equipment: 'Potions, tools, wondrous items, and consumable gear.',
  weapon: 'Melee and ranged weapons, from daggers to greataxes.',
  sidekick: 'Companions, familiars, and NPCs that fight alongside the party.',
  anything: 'A blank template — build any custom card with full control.',
};

const ASPECT_OPTIONS: { value: ImageAspect; label: string; description: string; icon: string }[] = [
  { value: 'landscape', label: 'Shorter', description: 'Wide strip — least vertical space for art', icon: '▬' },
  { value: 'square', label: 'Standard', description: '3:2 frame — compact, balanced', icon: '■' },
  { value: 'portrait', label: 'Longer', description: 'Square (1:1) — more art height than standard', icon: '▮' },
];

const FONT_SIZE_OPTIONS: { value: CardFontSize; label: string; description: string }[] = [
  { value: 'sm', label: 'Small', description: 'More text fits on the card' },
  { value: 'md', label: 'Normal', description: 'Default readable size' },
  { value: 'lg', label: 'Large', description: 'Bold, easy-to-read text' },
];

function buildPreviewState(
  type: CardType,
  imageAspect: ImageAspect,
  fontSize: CardFontSize
) {
  const cfg = CARD_TYPES[type];
  const fields = getDefaultFields(type);
  const typeLabels: Record<CardType, string> = {
    spell: 'Fireball', armor: 'Plate Mail', equipment: 'Healing Potion',
    weapon: 'Longsword +1', sidekick: 'Forest Guide', anything: 'Custom Card',
  };
  const typeDescs: Record<CardType, string> = {
    spell: '<p>Deal <strong>8d6 fire</strong> damage in a 20 ft radius. DC 18 Dex save for half.</p>',
    armor: '<p>+18 AC. Disadvantage on Stealth checks. Requires 15 Strength.</p>',
    equipment: '<p>Restore <strong>2d4+2 HP</strong>. Bonus action to consume during combat.</p>',
    weapon: '<p>Deal <strong>1d8+1 slashing</strong> damage. Versatile (1d10). Magical.</p>',
    sidekick: '<p>Advantage on Perception and Survival checks. Speaks Common and Elvish.</p>',
    anything: '<p>Write anything you like here. Stats, rules, lore — your card, your rules.</p>',
  };
  return {
    type,
    rarity: 'legendary' as const,
    icon: cfg.defaultIcon,
    image: null,
    backgroundTexture: null,
    backImage: null,
    ...DEFAULT_CARD_PALETTE,
    fields: {
      ...fields,
      name: typeLabels[type],
      desc: typeDescs[type],
    },
    imageAspect,
    fontSize,
    showPips: true,
  };
}

export default function CardTypePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<CardType>('spell');
  const [aspect, setAspect] = useState<ImageAspect>('square');
  const [fontSize, setFontSize] = useState<CardFontSize>('md');

  const selectedLabel = CARD_TYPE_ORDER.find(t => t.type === selected)?.label ?? selected;

  const previewState = useMemo(
    () => buildPreviewState(selected, aspect, fontSize),
    [selected, aspect, fontSize]
  );

  function handleCreate() {
    router.push(`/card/new?type=${selected}&aspect=${aspect}&fontSize=${fontSize}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-2">
        <Link
          href="/card"
          className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
        >
          ← All cards
        </Link>
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          {/* Preview — top on narrow screens, right on xl */}
          <aside className="order-1 flex w-full flex-col items-center rounded-xl border border-bdr bg-prev/80 p-4 xl:order-2 xl:sticky xl:top-6 xl:w-[min(100%,300px)] xl:shrink-0 xl:border-l xl:border-t-0">
            <span className="prev-label mb-2">
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Preview{' '}
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
            </span>
            <div className="card-scale-wrap relative flex w-full justify-center">
              <CardRenderer state={previewState} />
            </div>
            <p className="prev-note mt-2 max-w-[260px] text-center">
              Updates when you change type, picture shape, or text size
            </p>
          </aside>

          <div className="order-2 min-w-0 flex-1 xl:order-1">
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
              Step 1 — Choose a template
            </p>
            <h1 className="mt-1 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold">
              Card Forge
            </h1>
            <p className="mt-1 text-sm text-bronze">
              Choose type, picture shape, and text size — the preview updates as you go.
            </p>

            {/* Type grid — icon + label only */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {CARD_TYPE_ORDER.map(({ type, label, iconId }) => {
                const isActive = selected === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelected(type)}
                    className={[
                      'group flex flex-row items-center gap-3 rounded border-2 px-4 py-3 text-left transition-all duration-150',
                      'bg-panel/60 hover:bg-panel',
                      isActive
                        ? 'border-gold shadow-[0_0_12px_rgba(201,168,76,0.15)]'
                        : 'border-bdr hover:border-gold/40',
                    ].join(' ')}
                  >
                    <IconDisplay
                      iconId={iconId}
                      className={[
                        'h-9 w-9 shrink-0 opacity-80',
                        isActive ? 'text-gold' : 'text-bronze group-hover:text-gold',
                      ].join(' ')}
                    />
                    <span
                      className={[
                        'font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider',
                        isActive ? 'text-gold' : 'text-bronze group-hover:text-gold',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected type description */}
            <p className="mt-6 min-h-[1.5rem] text-sm text-muted">
              <span className="font-semibold text-bronze">{selectedLabel}:</span>{' '}
              {TYPE_DESCRIPTIONS[selected]}
            </p>

            {/* Layout options */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Image aspect */}
            <div>
              <p className="mb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
                Picture shape
              </p>
              <div className="flex flex-col gap-2">
                {ASPECT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAspect(opt.value)}
                    className={[
                      'flex items-center gap-3 rounded border px-4 py-3 text-left transition-all duration-150',
                      aspect === opt.value
                        ? 'border-gold bg-panel text-gold'
                        : 'border-bdr bg-panel/40 text-bronze hover:border-gold/40 hover:bg-panel',
                    ].join(' ')}
                  >
                    <span className="w-4 text-center text-base">{opt.icon}</span>
                    <span>
                      <span className="block font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-muted">{opt.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <p className="mb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
                Text Size
              </p>
              <div className="flex flex-col gap-2">
                {FONT_SIZE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFontSize(opt.value)}
                    className={[
                      'flex items-center gap-3 rounded border px-4 py-3 text-left transition-all duration-150',
                      fontSize === opt.value
                        ? 'border-gold bg-panel text-gold'
                        : 'border-bdr bg-panel/40 text-bronze hover:border-gold/40 hover:bg-panel',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'font-[var(--font-cinzel),serif] font-black',
                        opt.value === 'sm' ? 'text-xs' : opt.value === 'md' ? 'text-sm' : 'text-base',
                      ].join(' ')}
                    >
                      Aa
                    </span>
                    <span>
                      <span className="block font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-muted">{opt.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-end gap-4 border-t border-bdr pt-6">
              <Link href="/card" className="panel-btn text-sm text-muted">
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleCreate}
                className="panel-btn text-sm text-gold hover:border-gold"
              >
                Create {selectedLabel} Card →
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
