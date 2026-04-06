'use client';

import type { CardFontSize, ImageAspect } from '@/lib/types';
import { MtgCardState, MtgFrameColor, MtgKeyword } from '@/lib/mtgTypes';
import {
  MTG_CARD_TYPES,
  MTG_COLOR_LABELS,
  MTG_FRAME_PALETTES,
  MTG_KEYWORDS,
  MTG_RARITIES,
  deriveFrameColor,
} from '@/lib/mtgCardConfig';
import MtgManaCostPicker from '@/components/MtgManaCostPicker';

interface FieldChangeHandler {
  (key: keyof MtgCardState, value: unknown): void;
}

interface CommonProps {
  state: MtgCardState;
  onChange: FieldChangeHandler;
}

const ASPECT_OPTIONS: { value: ImageAspect; label: string; description: string; icon: string }[] = [
  { value: 'landscape', label: 'Shorter', description: 'Wide strip — least vertical space for art', icon: '▬' },
  { value: 'square', label: 'Standard', description: '3:2 frame — same default as RPG forge', icon: '■' },
  { value: 'portrait', label: 'Longer', description: 'Square (1:1) — more art height', icon: '▮' },
];

const FONT_SIZE_OPTIONS: { value: CardFontSize; label: string; description: string }[] = [
  { value: 'sm', label: 'Small', description: 'More text fits on the card' },
  { value: 'md', label: 'Normal', description: 'Default readable size' },
  { value: 'lg', label: 'Large', description: 'Bold, easy-to-read text' },
];

/** Picture shape + text size — mirrors RPG Card Forge. */
export function MtgLayoutSection({ state, onChange }: CommonProps) {
  const aspect = state.imageAspect ?? 'square';
  const fontSize = state.fontSize ?? 'md';

  return (
    <div className="fsec">
      <h3>Layout</h3>
      <p className="mb-3 text-xs text-muted">
        Picture shape and text size work the same way as Role Playing cards.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
            Picture shape
          </p>
          <div className="flex flex-col gap-2">
            {ASPECT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('imageAspect', opt.value)}
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
                onClick={() => onChange('fontSize', opt.value)}
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
    </div>
  );
}

/** Name + legendary/modifiers + set info */
export function MtgIdentitySection({ state, onChange }: CommonProps) {
  const cfg = MTG_CARD_TYPES[state.type];

  return (
    <div className="fsec">
      <h3>Identity</h3>

      <div className="frow c1">
        <div className="fg">
          <label>Card Name</label>
          <input
            type="text"
            value={state.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="e.g. Lightning Bolt"
          />
        </div>
      </div>

      {/* Mana cost picker */}
      {cfg.hasManaCost && (
        <div className="frow c1 mt-2">
          <MtgManaCostPicker
            label="Mana Cost"
            value={state.manaCost}
            onChange={val => {
              onChange('manaCost', val);
            }}
          />
        </div>
      )}

      {/* Modifiers */}
      <div className="frow c1 mt-3">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Modifiers
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'isLegendary', label: 'Legendary' },
            { key: 'isSnow', label: 'Snow' },
            { key: 'isToken', label: 'Token' },
            { key: 'isBasic', label: 'Basic' },
          ].map(mod => (
            <label
              key={mod.key}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-bdr-2 bg-panel/60 px-2.5 py-1.5 text-xs text-bronze transition-all hover:border-gold/40"
            >
              <input
                type="checkbox"
                checked={Boolean(state[mod.key as keyof MtgCardState])}
                onChange={e => onChange(mod.key as keyof MtgCardState, e.target.checked)}
                className="accent-gold"
              />
              {mod.label}
            </label>
          ))}
        </div>
      </div>

      {/* Subtype */}
      <div className="frow c1 mt-3">
        <div className="fg">
          <label>Subtype</label>
          <input
            type="text"
            value={state.subtype}
            onChange={e => onChange('subtype', e.target.value)}
            placeholder={state.type === 'creature' ? 'e.g. Dragon' : state.type === 'land' ? 'e.g. Forest' : ''}
          />
        </div>
      </div>
    </div>
  );
}

/** Frame color + rarity */
export function MtgFrameSection({ state, onChange }: CommonProps) {
  const frameColors: MtgFrameColor[] = ['W', 'U', 'B', 'R', 'G', 'M', 'C', 'L'];

  return (
    <div className="fsec">
      <h3>Frame & Rarity</h3>

      {/* Color identity chips */}
      <div className="frow c1">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Card Colors (identity)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(['W', 'U', 'B', 'R', 'G'] as const).map(color => {
            const isActive = state.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  const next = isActive
                    ? state.colors.filter(c => c !== color)
                    : [...state.colors, color];
                  onChange('colors', next);
                  onChange('frameColor', deriveFrameColor(next));
                }}
                className={[
                  'rounded border px-3 py-1.5 text-xs font-semibold transition-all',
                  isActive ? 'border-gold bg-mid text-gold' : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40',
                ].join(' ')}
              >
                {MTG_COLOR_LABELS[color]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame color override */}
      <div className="frow c1 mt-3">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Frame Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {frameColors.map(fc => {
            const palette = MTG_FRAME_PALETTES[fc];
            const isActive = state.frameColor === fc;
            return (
              <button
                key={fc}
                type="button"
                title={MTG_COLOR_LABELS[fc]}
                onClick={() => onChange('frameColor', fc)}
                className={[
                  'h-8 w-8 rounded-full border-2 transition-all',
                  isActive ? 'scale-110 border-gold shadow-[0_0_8px_rgba(201,168,76,0.4)]' : 'border-bdr-2 hover:border-gold/50',
                ].join(' ')}
                style={{ background: `linear-gradient(135deg, ${palette.frameTop}, ${palette.frameBottom})` }}
              />
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted">{MTG_COLOR_LABELS[state.frameColor]}</p>
      </div>

      {/* Rarity */}
      <div className="frow c1 mt-3">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-2 block">
          Rarity
        </label>
        <div className="rar-opts">
          {MTG_RARITIES.map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => onChange('rarity', r.key)}
              className={[
                'rar-btn',
                state.rarity === r.key ? 'active' : '',
              ].join(' ')}
              style={state.rarity === r.key ? { borderColor: r.symbolColor, color: r.symbolColor } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Set info */}
      <div className="frow c2 mt-3">
        <div className="fg">
          <label>Set Code</label>
          <input
            type="text"
            value={state.setCode}
            onChange={e => onChange('setCode', e.target.value.toUpperCase().slice(0, 5))}
            placeholder="CFG"
            maxLength={5}
          />
        </div>
        <div className="fg">
          <label>Collector #</label>
          <input
            type="text"
            value={state.collectorNumber}
            onChange={e => onChange('collectorNumber', e.target.value)}
            placeholder="001"
          />
        </div>
      </div>
    </div>
  );
}

/** Rules text + flavor text with symbol insertion */
export function MtgRulesTextSection({ state, onChange }: CommonProps) {
  function insertAtCursor(field: 'rulesText' | 'flavorText', sym: string) {
    onChange(field, (state[field] ?? '') + sym);
  }

  return (
    <div className="fsec">
      <h3>Rules Text</h3>

      {/* Keyword abilities */}
      <div className="frow c1">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Keyword Abilities
        </label>
        <div className="max-h-[160px] overflow-y-auto rounded border border-bdr-2 bg-field-bg/30 p-2">
          <div className="flex flex-wrap gap-1.5">
            {MTG_KEYWORDS.map(kw => {
              const isActive = state.keywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    const next: MtgKeyword[] = isActive
                      ? state.keywords.filter(k => k !== kw)
                      : [...state.keywords, kw];
                    onChange('keywords', next);
                  }}
                  className={[
                    'rounded border px-2 py-0.5 text-[0.72rem] transition-all',
                    isActive
                      ? 'border-gold bg-mid text-gold font-semibold'
                      : 'border-bdr-2 bg-panel/60 text-muted hover:border-gold/40 hover:text-bronze',
                  ].join(' ')}
                >
                  {kw}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted italic">
          Selected keywords appear in italics at the start of rules text.
        </p>
      </div>

      {/* Symbol insert bar */}
      <div className="frow c1 mt-3">
        <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-wider text-gold-dark mb-1 block">
          Rules Text
        </label>
        <SymbolInsertRow onInsert={sym => insertAtCursor('rulesText', sym)} />
        <textarea
          value={state.rulesText}
          onChange={e => onChange('rulesText', e.target.value)}
          rows={4}
          placeholder="Use {T} for tap, {W} {U} etc. for mana symbols…"
          className="!rounded-t-none border-t-0"
        />
      </div>

      {/* Flavor text */}
      <div className="frow c1 mt-2">
        <div className="fg">
          <label>Flavor Text</label>
          <textarea
            value={state.flavorText}
            onChange={e => onChange('flavorText', e.target.value)}
            rows={2}
            placeholder="Italic flavor text displayed below the rules text…"
          />
        </div>
      </div>
    </div>
  );
}

/** Inline symbol row for quick insertion */
function SymbolInsertRow({ onInsert }: { onInsert: (sym: string) => void }) {
  const symbols = ['T', 'W', 'U', 'B', 'R', 'G', 'C', '1', '2', '3', 'X'];
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t border border-bdr-2 bg-panel/80 px-2 py-1">
      <span className="mr-1 text-[0.6rem] font-semibold uppercase tracking-wider text-gold-dark font-[var(--font-cinzel),serif]">
        Insert:
      </span>
      {symbols.map(sym => (
        <button
          key={sym}
          type="button"
          title={`{${sym}}`}
          onClick={() => onInsert(`{${sym}}`)}
          className="rounded border border-bdr/50 bg-field-bg/30 px-1.5 py-0.5 text-[0.65rem] font-mono text-bronze transition-all hover:border-gold/40 hover:text-gold"
        >
          {`{${sym}}`}
        </button>
      ))}
    </div>
  );
}

/** Art upload section */
export function MtgArtSection({ state, onChange }: CommonProps) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      onChange('image', (ev.target?.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fsec">
      <h3>Card Art</h3>

      <div className="frow c1">
        <label className="upload-area cursor-pointer">
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
          <span className="upload-icon">🖼</span>
          <p className="mt-1 text-xs text-gold-dark">Click to upload card art</p>
          {state.image && <p className="mt-1 text-[0.65rem] text-muted">Image uploaded ✓</p>}
        </label>
        {state.image && (
          <button
            type="button"
            onClick={() => onChange('image', null)}
            className="clear-btn mt-1"
          >
            Remove art
          </button>
        )}
      </div>

      <div className="frow c1 mt-2">
        <div className="fg">
          <label>Artist Name</label>
          <input
            type="text"
            value={state.artistName}
            onChange={e => onChange('artistName', e.target.value)}
            placeholder="Illustrator name"
          />
        </div>
      </div>
    </div>
  );
}
