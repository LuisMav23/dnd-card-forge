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
import MtgCardRenderer from '@/components/MtgCardRenderer';
import { getDefaultMtgState } from '@/lib/mtgCardConfig';
import type { MtgKeyword } from '@/lib/mtgTypes';

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

const MTG_PREVIEW_STATE = {
  ...getDefaultMtgState('creature'),
  name: 'Storm Dragon',
  manaCost: '{3}{R}{R}',
  subtype: 'Dragon',
  isLegendary: false,
  rulesText: 'Flying, Trample\n\nWhen ~ enters, deal 3 damage to any target.',
  flavorText: '"Wings of fire, heart of storms."',
  power: '5',
  toughness: '4',
  rarity: 'rare' as const,
  keywords: ['Flying', 'Trample'] as MtgKeyword[],
  artistName: 'The Forge',
};

export default function CardTypePicker() {
  const router = useRouter();
  const [section, setSection] = useState<'rpg' | 'trading'>('rpg');
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
        <div className="mx-auto w-full max-w-6xl">
          {/* Page header */}
          <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
            Step 1 — Choose a card category
          </p>
          <h1 className="mt-1 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold">
            Card Forge
          </h1>
          <p className="mt-1 text-sm text-bronze">
            Select whether you want to create a Role Playing card or a Trading Card.
          </p>

          {/* Category tabs */}
          <div className="mt-6 flex gap-2 border-b border-bdr pb-0">
            <button
              type="button"
              onClick={() => setSection('rpg')}
              className={[
                'flex items-center gap-2 rounded-t border border-b-0 px-5 py-2.5 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider transition-all',
                section === 'rpg'
                  ? 'border-bdr bg-bg text-gold -mb-px pb-3'
                  : 'border-transparent bg-panel/40 text-muted hover:text-bronze',
              ].join(' ')}
            >
              <span>⚔</span> Role Playing Cards
            </button>
            <button
              type="button"
              onClick={() => setSection('trading')}
              className={[
                'flex items-center gap-2 rounded-t border border-b-0 px-5 py-2.5 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider transition-all',
                section === 'trading'
                  ? 'border-bdr bg-bg text-gold -mb-px pb-3'
                  : 'border-transparent bg-panel/40 text-muted hover:text-bronze',
              ].join(' ')}
            >
              <span>⬡</span> Trading Cards
            </button>
          </div>

          {/* ── RPG SECTION ── */}
          {section === 'rpg' && (
            <div className="mt-8 flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
              {/* Preview */}
              <aside className="order-1 flex w-full flex-col items-center rounded-xl border border-bdr bg-prev/80 p-4 xl:order-2 xl:sticky xl:top-6 xl:w-[min(100%,300px)] xl:shrink-0">
                <span className="prev-label mb-2">
                  <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Preview{' '}
                  <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
                </span>
                <div className="card-scale-wrap relative flex w-full justify-center">
                  <CardRenderer state={previewState} />
                </div>
                <p className="prev-note mt-2 max-w-[260px] text-center">
                  Updates when you change type, shape, or size
                </p>
              </aside>

              <div className="order-2 min-w-0 flex-1 xl:order-1">
                <p className="text-xs text-muted mb-4">
                  DnD-style cards for spells, weapons, armor, equipment, and companions.
                </p>

                {/* Type grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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

                <p className="mt-6 min-h-[1.5rem] text-sm text-muted">
                  <span className="font-semibold text-bronze">{selectedLabel}:</span>{' '}
                  {TYPE_DESCRIPTIONS[selected]}
                </p>

                {/* Layout options */}
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          )}

          {/* ── TRADING CARDS SECTION ── */}
          {section === 'trading' && (
            <div className="mt-8 flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
              {/* MTG Preview */}
              <aside className="order-1 flex w-full flex-col items-center rounded-xl border border-bdr bg-prev/80 p-4 xl:order-2 xl:sticky xl:top-6 xl:w-[min(100%,300px)] xl:shrink-0">
                <span className="prev-label mb-2">
                  <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> MTG Preview{' '}
                  <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
                </span>
                <div className="mtg-card-scale-wrap relative flex w-full justify-center">
                  <MtgCardRenderer state={MTG_PREVIEW_STATE} />
                </div>
              </aside>

              <div className="order-2 min-w-0 flex-1 xl:order-1">
                <p className="text-xs text-muted mb-6">
                  Create custom trading cards inspired by popular card game systems.
                </p>

                {/* MTG card game tile */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Link
                    href="/card/new?game=mtg"
                    className="group flex flex-col gap-3 rounded-xl border-2 border-bdr bg-panel/60 p-5 transition-all hover:border-gold/60 hover:bg-panel hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⬡</span>
                      <div>
                        <p className="font-[var(--font-cinzel),serif] text-sm font-black uppercase tracking-wider text-gold group-hover:text-gold-light">
                          Magic: The Gathering
                        </p>
                        <p className="text-xs text-muted mt-0.5">Custom MTG-style cards</p>
                      </div>
                    </div>
                    <p className="text-xs text-bronze leading-relaxed">
                      Create custom Creatures, Instants, Sorceries, Enchantments, Artifacts,
                      Planeswalkers, Lands, Battles, and Sagas with authentic MTG layout, mana cost
                      builder, and keyword abilities.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['9 Card Types', 'Mana Symbols', 'Keywords', 'P/T & Loyalty', 'Sagas'].map(tag => (
                        <span
                          key={tag}
                          className="rounded-full border border-bdr-2 bg-bg/60 px-2 py-0.5 text-[0.65rem] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="self-end font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark group-hover:text-gold">
                      Start creating →
                    </span>
                  </Link>

                  {/* Placeholder for future TCGs */}
                  <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-bdr/50 bg-panel/30 p-5 opacity-50">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🃏</span>
                      <div>
                        <p className="font-[var(--font-cinzel),serif] text-sm font-black uppercase tracking-wider text-muted">
                          More TCGs
                        </p>
                        <p className="text-xs text-muted mt-0.5">Coming soon</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      Additional trading card game systems will be added in future updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}
