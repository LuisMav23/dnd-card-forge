import type { CardFontSize, ImageAspect } from './types';
import {
  MtgCardType,
  MtgCardState,
  MtgFrameColor,
  MtgFramePalette,
  MtgKeyword,
  MtgRarity,
} from './mtgTypes';

export interface MtgCardTypeConfig {
  label: string;
  description: string;
  iconId: string;
  defaultFrameColor: MtgFrameColor;
  hasManaCost: boolean;
  hasPowerToughness: boolean;
  hasLoyalty: boolean;
  hasDefense: boolean;
  hasSagaChapters: boolean;
}

export const MTG_CARD_TYPES: Record<MtgCardType, MtgCardTypeConfig> = {
  creature: {
    label: 'Creature',
    description: 'Permanent that attacks, blocks, and has power/toughness.',
    iconId: 'swords',
    defaultFrameColor: 'G',
    hasManaCost: true,
    hasPowerToughness: true,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  land: {
    label: 'Land',
    description: 'Produces mana. Played without paying a mana cost.',
    iconId: 'mountain',
    defaultFrameColor: 'L',
    hasManaCost: false,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  instant: {
    label: 'Instant',
    description: 'Cast at any time — even during an opponent\'s turn.',
    iconId: 'zap',
    defaultFrameColor: 'U',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  sorcery: {
    label: 'Sorcery',
    description: 'Cast during your main phase when the stack is empty.',
    iconId: 'sparkles',
    defaultFrameColor: 'R',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  enchantment: {
    label: 'Enchantment',
    description: 'Persistent magical effect that stays on the battlefield.',
    iconId: 'star',
    defaultFrameColor: 'W',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  artifact: {
    label: 'Artifact',
    description: 'Usually colorless permanents: equipment, vehicles, and more.',
    iconId: 'gem',
    defaultFrameColor: 'C',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: false,
  },
  planeswalker: {
    label: 'Planeswalker',
    description: 'Powerful allies with loyalty abilities and a starting loyalty counter.',
    iconId: 'user-round',
    defaultFrameColor: 'M',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: true,
    hasDefense: false,
    hasSagaChapters: false,
  },
  battle: {
    label: 'Battle',
    description: 'A new card type with a defense counter — Siege subtype.',
    iconId: 'shield',
    defaultFrameColor: 'M',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: true,
    hasSagaChapters: false,
  },
  saga: {
    label: 'Saga',
    description: 'An enchantment with chapter abilities that trigger each turn.',
    iconId: 'scroll-text',
    defaultFrameColor: 'W',
    hasManaCost: true,
    hasPowerToughness: false,
    hasLoyalty: false,
    hasDefense: false,
    hasSagaChapters: true,
  },
};

export const MTG_CARD_TYPE_ORDER: MtgCardType[] = [
  'creature',
  'instant',
  'sorcery',
  'enchantment',
  'artifact',
  'planeswalker',
  'land',
  'battle',
  'saga',
];

export const MTG_KEYWORDS: MtgKeyword[] = [
  'Flying',
  'Trample',
  'Deathtouch',
  'Lifelink',
  'Haste',
  'First Strike',
  'Double Strike',
  'Vigilance',
  'Reach',
  'Menace',
  'Hexproof',
  'Indestructible',
  'Flash',
  'Defender',
  'Shroud',
  'Ward',
  'Toxic',
  'Prowess',
  'Exalted',
  'Persist',
  'Undying',
  'Modular',
  'Infect',
  'Wither',
  'Cascade',
  'Convoke',
  'Delve',
  'Storm',
  'Kicker',
  'Cycling',
  'Morph',
  'Annihilator',
  'Affinity',
  'Phasing',
  'Echo',
  'Shadow',
  'Entwine',
  'Flanking',
  'Bushido',
  'Protection',
  'Splice',
  'Bloodthirst',
  'Graft',
  'Devour',
  'Haunt',
  'Soulshift',
  'Fear',
  'Intimidate',
  'Suspend',
  'Fading',
  'Vanishing',
];

export const MTG_RARITIES: { key: MtgRarity; label: string; symbolColor: string }[] = [
  { key: 'common', label: 'Common', symbolColor: '#1a1a1a' },
  { key: 'uncommon', label: 'Uncommon', symbolColor: '#a8a9ac' },
  { key: 'rare', label: 'Rare', symbolColor: '#a58e4a' },
  { key: 'mythic', label: 'Mythic Rare', symbolColor: '#bf4427' },
];

export const MTG_LAND_SUBTYPES = [
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Cave',
  'Desert',
  'Gate',
  'Lair',
  'Locus',
  'Mine',
  'Power-Plant',
  'Sphere',
  'Tower',
];

export const MTG_ARTIFACT_SUBTYPES = [
  'Equipment',
  'Vehicle',
  'Treasure',
  'Food',
  'Blood',
  'Clue',
  'Contraption',
  'Fortification',
  'Powerstone',
];

export const MTG_ENCHANTMENT_SUBTYPES = [
  'Aura',
  'Background',
  'Cartouche',
  'Class',
  'Curse',
  'Role',
  'Rune',
  'Shrine',
];

export const MTG_BATTLE_SUBTYPES = ['Siege'];

export const MTG_CREATURE_TYPES = [
  'Angel', 'Archer', 'Artificer', 'Assassin', 'Avatar', 'Barbarian',
  'Beast', 'Bird', 'Cleric', 'Construct', 'Demon', 'Devil',
  'Dragon', 'Drake', 'Druid', 'Dryad', 'Dwarf', 'Elf',
  'Elemental', 'Faerie', 'Fish', 'Fungus', 'Giant', 'Goblin',
  'God', 'Golem', 'Gorgon', 'Griffin', 'Horror', 'Human',
  'Hydra', 'Imp', 'Insect', 'Knight', 'Leviathan', 'Lizard',
  'Merfolk', 'Minotaur', 'Monk', 'Nightmare', 'Ninja', 'Noble',
  'Ogre', 'Orc', 'Pegasus', 'Phoenix', 'Pirate', 'Plant',
  'Rogue', 'Salamander', 'Samurai', 'Scarecrow', 'Serpent', 'Shade',
  'Shaman', 'Skeleton', 'Slith', 'Sliver', 'Snake', 'Soldier',
  'Spider', 'Spirit', 'Sphinx', 'Treefolk', 'Turtle', 'Unicorn',
  'Vampire', 'Vedalken', 'Wall', 'Warrior', 'Wizard', 'Wolf',
  'Wurm', 'Zombie',
];

/** Frame color palettes — matched to authentic MTG card frame hues */
export const MTG_FRAME_PALETTES: Record<MtgFrameColor, MtgFramePalette> = {
  W: {
    frameTop: '#f4efda',
    frameBottom: '#d8cfb0',
    textBoxBg: '#ede8d0',
    nameBg: '#f4efda',
    borderColor: '#c8bfa0',
    textColor: '#1a140c',
  },
  U: {
    frameTop: '#aac5d8',
    frameBottom: '#5888a8',
    textBoxBg: '#c8dce8',
    nameBg: '#aac5d8',
    borderColor: '#4878a0',
    textColor: '#0c1820',
  },
  B: {
    frameTop: '#8a7c72',
    frameBottom: '#302820',
    textBoxBg: '#b0a498',
    nameBg: '#8a7c72',
    borderColor: '#201810',
    textColor: '#f0e8d8',
  },
  R: {
    frameTop: '#d88850',
    frameBottom: '#b05020',
    textBoxBg: '#e8a878',
    nameBg: '#d88850',
    borderColor: '#904010',
    textColor: '#1a0c04',
  },
  G: {
    frameTop: '#80a870',
    frameBottom: '#385830',
    textBoxBg: '#a8c898',
    nameBg: '#80a870',
    borderColor: '#285020',
    textColor: '#0c180a',
  },
  M: {
    frameTop: '#c8a038',
    frameBottom: '#906818',
    textBoxBg: '#dcc070',
    nameBg: '#c8a038',
    borderColor: '#785008',
    textColor: '#14100a',
  },
  C: {
    frameTop: '#bcc0c0',
    frameBottom: '#888c8c',
    textBoxBg: '#d0d4d4',
    nameBg: '#bcc0c0',
    borderColor: '#707878',
    textColor: '#141414',
  },
  L: {
    frameTop: '#c0b080',
    frameBottom: '#887040',
    textBoxBg: '#d0c090',
    nameBg: '#c0b080',
    borderColor: '#786030',
    textColor: '#1a1408',
  },
};

export const MTG_COLOR_LABELS: Record<MtgFrameColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  M: 'Gold (Multicolor)',
  C: 'Colorless / Artifact',
  L: 'Land',
};

/** Derives the frame color key from the colors array. */
export function deriveFrameColor(colors: string[]): MtgFrameColor {
  if (colors.length === 0) return 'C';
  if (colors.length > 1) return 'M';
  return colors[0] as MtgFrameColor;
}

export function buildTypeLine(state: MtgCardState): string {
  const parts: string[] = [];

  if (state.isBasic) parts.push('Basic');
  if (state.isSnow) parts.push('Snow');
  if (state.isLegendary) parts.push('Legendary');
  if (state.isToken) parts.push('Token');

  const typeLabel = MTG_CARD_TYPES[state.type].label;
  if (state.type === 'saga') {
    parts.push('Enchantment — Saga');
  } else {
    parts.push(typeLabel);
  }

  if (state.subtype) {
    return `${parts.join(' ')} — ${state.subtype}`;
  }
  return parts.join(' ');
}

export function getDefaultMtgState(type: MtgCardType): MtgCardState {
  const cfg = MTG_CARD_TYPES[type];
  return {
    cardGame: 'mtg',
    type,
    isLegendary: false,
    isSnow: false,
    isToken: false,
    isBasic: type === 'land',
    name: '',
    manaCost: '',
    colors: [],
    frameColor: cfg.defaultFrameColor,
    image: null,
    artistName: '',
    subtype: '',
    rulesText: '',
    flavorText: '',
    keywords: [],
    power: type === 'creature' ? '1' : '',
    toughness: type === 'creature' ? '1' : '',
    startingLoyalty: type === 'planeswalker' ? '3' : '',
    loyaltyAbilities:
      type === 'planeswalker'
        ? [
            { cost: '+1', text: '' },
            { cost: '0', text: '' },
            { cost: '−6', text: '' },
          ]
        : [],
    defense: type === 'battle' ? '6' : '',
    sagaChapters:
      type === 'saga'
        ? [
            { chapters: 'I', text: '' },
            { chapters: 'II', text: '' },
            { chapters: 'III', text: '' },
          ]
        : [],
    rarity: 'rare',
    setCode: 'CFG',
    collectorNumber: '001',
    customFramePalette: null,
    imageAspect: 'square',
    fontSize: 'md',
  };
}

function isImageAspect(v: unknown): v is ImageAspect {
  return v === 'landscape' || v === 'square' || v === 'portrait';
}

function isCardFontSize(v: unknown): v is CardFontSize {
  return v === 'sm' || v === 'md' || v === 'lg';
}

/** Merge API/legacy JSON into a full MtgCardState (fills imageAspect / fontSize for old saves). */
export function hydrateMtgCardState(input: unknown): MtgCardState {
  if (!input || typeof input !== 'object') return getDefaultMtgState('creature');
  const raw = input as Partial<MtgCardState>;
  const type =
    raw.type && typeof raw.type === 'string' && raw.type in MTG_CARD_TYPES
      ? raw.type
      : 'creature';
  const base = getDefaultMtgState(type);
  return {
    ...base,
    ...raw,
    cardGame: 'mtg',
    type,
    loyaltyAbilities: Array.isArray(raw.loyaltyAbilities) ? raw.loyaltyAbilities : base.loyaltyAbilities,
    sagaChapters: Array.isArray(raw.sagaChapters) ? raw.sagaChapters : base.sagaChapters,
    keywords: Array.isArray(raw.keywords) ? raw.keywords : base.keywords,
    colors: Array.isArray(raw.colors) ? raw.colors : base.colors,
    imageAspect: isImageAspect(raw.imageAspect) ? raw.imageAspect : base.imageAspect,
    fontSize: isCardFontSize(raw.fontSize) ? raw.fontSize : base.fontSize,
  };
}

export const MTG_MANA_SYMBOLS_ORDERED = [
  'W', 'U', 'B', 'R', 'G',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  'X', 'Y', 'Z',
  'C', 'S',
  'T', 'Q',
] as const;

export type MtgManaSymbolKey = (typeof MTG_MANA_SYMBOLS_ORDERED)[number];
