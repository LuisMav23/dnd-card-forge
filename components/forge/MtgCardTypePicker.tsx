'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkle } from 'lucide-react';
import type { CardFontSize, ImageAspect } from '@/lib/types';
import { MtgCardType, MtgKeyword } from '@/lib/mtgTypes';
import { MTG_CARD_TYPES, MTG_CARD_TYPE_ORDER, MTG_RARITIES, getDefaultMtgState } from '@/lib/mtgCardConfig';
import MtgCardRenderer from '@/components/MtgCardRenderer';
import IconDisplay from '@/components/IconDisplay';

const PREVIEW_NAMES: Record<MtgCardType, string> = {
  creature: 'Storm Dragon',
  land: 'Ancient Ruins',
  instant: 'Counter Spell',
  sorcery: 'Apocalypse',
  enchantment: 'Ethereal Veil',
  artifact: 'Mox Sapphire',
  planeswalker: 'Saga Walker',
  battle: 'Siege of Dawn',
  saga: 'The Elder\'s Tale',
};

const PREVIEW_MANA: Record<MtgCardType, string> = {
  creature: '{2}{G}{G}',
  land: '',
  instant: '{1}{U}',
  sorcery: '{3}{R}{R}',
  enchantment: '{2}{W}',
  artifact: '{3}',
  planeswalker: '{3}{W}{B}',
  battle: '{2}{R}{W}',
  saga: '{3}{W}',
};

const PREVIEW_RULES: Record<MtgCardType, string> = {
  creature: 'Flying, Trample\n\nWhen ~ enters the battlefield, deal 3 damage to any target.',
  land: '{T}: Add {G} or {W} to your mana pool.',
  instant: 'Counter target spell.',
  sorcery: 'Destroy all creatures. They can\'t be regenerated.',
  enchantment: 'Creatures you control have hexproof.',
  artifact: '{T}: Add one mana of any color.',
  planeswalker: '',
  battle: 'When ~ enters, create three 1/1 tokens.\nDefeated — Draw three cards.',
  saga: '',
};

const PREVIEW_FLAVOR: Record<MtgCardType, string> = {
  creature: '"Wings of fire, heart of storms."',
  land: '"Time has swallowed this place whole."',
  instant: '"Not today."',
  sorcery: '"When the last light fades, nothing remains."',
  enchantment: '"Magic weaves a shield unseen."',
  artifact: '"Power without limitation."',
  planeswalker: '"I have seen a thousand worlds burn."',
  battle: '"The walls fell at dawn."',
  saga: '',
};

const PREVIEW_SUBTYPES: Record<MtgCardType, string> = {
  creature: 'Dragon',
  land: 'Forest',
  instant: '',
  sorcery: '',
  enchantment: '',
  artifact: '',
  planeswalker: 'Jace',
  battle: 'Siege',
  saga: '',
};

const PREVIEW_SAGA_CHAPTERS = [
  { chapters: 'I', text: 'Draw two cards.' },
  { chapters: 'II', text: 'Create a 2/2 token.' },
  { chapters: 'III', text: 'Destroy target permanent.' },
];

const PREVIEW_LOYALTY_ABILITIES = [
  { cost: '+2', text: 'Draw a card.' },
  { cost: '0', text: 'Create a 2/2 creature token.' },
  { cost: '−8', text: 'You get an emblem with "Draw three cards at the start of each turn."' },
];

const ASPECT_OPTIONS: { value: ImageAspect; label: string; description: string; icon: string }[] = [
  { value: 'landscape', label: 'Shorter', description: 'Wide strip — least vertical art', icon: '▬' },
  { value: 'square', label: 'Standard', description: '3:2 frame — RPG default', icon: '■' },
  { value: 'portrait', label: 'Longer', description: 'Square (1:1) — more art height', icon: '▮' },
];

const FONT_SIZE_OPTIONS: { value: CardFontSize; label: string; description: string }[] = [
  { value: 'sm', label: 'Small', description: 'More text fits on the card' },
  { value: 'md', label: 'Normal', description: 'Default readable size' },
  { value: 'lg', label: 'Large', description: 'Bold, easy-to-read text' },
];

function buildPreviewState(
  type: MtgCardType,
  imageAspect: ImageAspect,
  fontSize: CardFontSize
) {
  const base = getDefaultMtgState(type);
  const firstRarity = MTG_RARITIES[2]; // rare
  return {
    ...base,
    imageAspect,
    fontSize,
    name: PREVIEW_NAMES[type],
    manaCost: PREVIEW_MANA[type],
    rulesText: PREVIEW_RULES[type],
    flavorText: PREVIEW_FLAVOR[type],
    subtype: PREVIEW_SUBTYPES[type],
    rarity: firstRarity.key,
    isLegendary: type === 'planeswalker',
    isBasic: type === 'land',
    power: type === 'creature' ? '5' : '',
    toughness: type === 'creature' ? '5' : '',
    startingLoyalty: type === 'planeswalker' ? '4' : '',
    loyaltyAbilities: type === 'planeswalker' ? PREVIEW_LOYALTY_ABILITIES : [],
    sagaChapters: type === 'saga' ? PREVIEW_SAGA_CHAPTERS : [],
    defense: type === 'battle' ? '6' : '',
    artistName: 'The Forge',
    keywords: (type === 'creature' ? ['Flying', 'Trample'] : []) as MtgKeyword[],
  };
}

export default function MtgCardTypePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<MtgCardType>('creature');
  const [aspect, setAspect] = useState<ImageAspect>('square');
  const [fontSize, setFontSize] = useState<CardFontSize>('md');

  const previewState = useMemo(
    () => buildPreviewState(selected, aspect, fontSize),
    [selected, aspect, fontSize]
  );
  const cfg = MTG_CARD_TYPES[selected];

  function handleCreate() {
    router.push(
      `/card/new?game=mtg&type=${selected}&aspect=${aspect}&fontSize=${fontSize}`
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <div className="border-b border-bdr bg-panel/80 px-4 py-2">
        <Link
          href="/card/new"
          className="inline-flex font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
        >
          ← Card Forge
        </Link>
      </div>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          {/* Preview */}
          <aside className="order-1 flex w-full flex-col items-center rounded-xl border border-bdr bg-prev/80 p-4 xl:order-2 xl:sticky xl:top-6 xl:w-[min(100%,300px)] xl:shrink-0">
            <span className="prev-label mb-2">
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" /> Preview{' '}
              <Sparkle className="inline-block h-3 w-3 align-[-1px]" />
            </span>
            <div className="mtg-card-scale-wrap relative flex w-full justify-center">
              <MtgCardRenderer state={previewState} />
            </div>
            <p className="prev-note mt-2 max-w-[260px] text-center">
              Updates when you change type, picture shape, or text size
            </p>
          </aside>

          <div className="order-2 min-w-0 flex-1 xl:order-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-red-900/30 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-red-300 font-[var(--font-cinzel),serif] border border-red-800/40">
                ⬡ Magic: The Gathering
              </span>
            </div>
            <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
              Step 1 — Choose a card type
            </p>
            <h1 className="mt-1 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold">
              MTG Card Forge
            </h1>
            <p className="mt-1 text-sm text-bronze">
              Select the type of Magic: The Gathering card you want to create.
            </p>

            {/* Type grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {MTG_CARD_TYPE_ORDER.map(type => {
                const typeCfg = MTG_CARD_TYPES[type];
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
                      iconId={typeCfg.iconId}
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
                      {typeCfg.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <p className="mt-6 min-h-[1.5rem] text-sm text-muted">
              <span className="font-semibold text-bronze">{cfg.label}:</span>{' '}
              {cfg.description}
            </p>

            {/* Features of this card type */}
            <div className="mt-4 flex flex-wrap gap-2">
              {cfg.hasManaCost && (
                <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                  Mana Cost
                </span>
              )}
              {cfg.hasPowerToughness && (
                <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                  Power / Toughness
                </span>
              )}
              {cfg.hasLoyalty && (
                <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                  Loyalty Counter
                </span>
              )}
              {cfg.hasDefense && (
                <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                  Defense Counter
                </span>
              )}
              {cfg.hasSagaChapters && (
                <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                  Chapter Abilities
                </span>
              )}
              <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                Keyword Abilities
              </span>
              <span className="rounded-full border border-bdr-2 bg-panel/80 px-3 py-1 text-xs text-bronze">
                MTG Symbols
              </span>
            </div>

            {/* Layout — same as RPG forge */}
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
                  Text size
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
              <Link href="/card/new" className="panel-btn text-sm text-muted">
                ← Back
              </Link>
              <button
                type="button"
                onClick={handleCreate}
                className="panel-btn text-sm text-gold hover:border-gold"
              >
                Create {cfg.label} →
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
