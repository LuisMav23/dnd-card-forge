import type { CardFontSize, ImageAspect } from './types';

export type MtgCardType =
  | 'creature'
  | 'land'
  | 'instant'
  | 'sorcery'
  | 'enchantment'
  | 'artifact'
  | 'planeswalker'
  | 'battle'
  | 'saga';

export type MtgColor = 'W' | 'U' | 'B' | 'R' | 'G';

/** Frame color key — derived from colors or manually overridden */
export type MtgFrameColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'M' | 'C' | 'L';

export type MtgRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export type MtgKeyword =
  | 'Flying'
  | 'Trample'
  | 'Deathtouch'
  | 'Lifelink'
  | 'Haste'
  | 'First Strike'
  | 'Double Strike'
  | 'Vigilance'
  | 'Reach'
  | 'Menace'
  | 'Hexproof'
  | 'Indestructible'
  | 'Flash'
  | 'Defender'
  | 'Shroud'
  | 'Ward'
  | 'Toxic'
  | 'Prowess'
  | 'Exalted'
  | 'Persist'
  | 'Undying'
  | 'Modular'
  | 'Infect'
  | 'Wither'
  | 'Cascade'
  | 'Convoke'
  | 'Delve'
  | 'Storm'
  | 'Kicker'
  | 'Cycling'
  | 'Morph'
  | 'Megamorph'
  | 'Annihilator'
  | 'Affinity'
  | 'Phasing'
  | 'Echo'
  | 'Shadow'
  | 'Entwine'
  | 'Flanking'
  | 'Bushido'
  | 'Protection'
  | 'Splice'
  | 'Cumulative Upkeep'
  | 'Banding'
  | 'Landwalk'
  | 'Intimidate'
  | 'Fear'
  | 'Horsemanship'
  | 'Ninjutsu'
  | 'Offering'
  | 'Ripple'
  | 'Suspend'
  | 'Vanishing'
  | 'Fading'
  | 'Amplify'
  | 'Devour'
  | 'Absorb'
  | 'Bloodthirst'
  | 'Graft'
  | 'Haunt'
  | 'Soulshift';

export interface MtgLoyaltyAbility {
  cost: string;
  text: string;
}

export interface MtgSagaChapter {
  chapters: string;
  text: string;
}

export interface MtgFramePalette {
  frameTop: string;
  frameBottom: string;
  textBoxBg: string;
  nameBg: string;
  borderColor: string;
  textColor: string;
}

export interface MtgCardState {
  cardGame: 'mtg';
  type: MtgCardType;
  isLegendary: boolean;
  isSnow: boolean;
  isToken: boolean;
  isBasic: boolean;
  name: string;
  manaCost: string;
  colors: MtgColor[];
  frameColor: MtgFrameColor;
  image: string | null;
  artistName: string;
  subtype: string;
  rulesText: string;
  flavorText: string;
  keywords: MtgKeyword[];
  power: string;
  toughness: string;
  startingLoyalty: string;
  loyaltyAbilities: MtgLoyaltyAbility[];
  defense: string;
  sagaChapters: MtgSagaChapter[];
  rarity: MtgRarity;
  setCode: string;
  collectorNumber: string;
  customFramePalette: MtgFramePalette | null;
  /** Art frame aspect — matches RPG forge (default: square = 3:2 standard). */
  imageAspect: ImageAspect;
  /** Base text scale on the card face — matches RPG forge. */
  fontSize: CardFontSize;
}

export type MtgCardAction =
  | { type: 'SET_MTG_CARD_TYPE'; payload: MtgCardType }
  | { type: 'SET_MTG_NAME'; payload: string }
  | { type: 'SET_MTG_MANA_COST'; payload: string }
  | { type: 'SET_MTG_FRAME_COLOR'; payload: MtgFrameColor }
  | { type: 'SET_MTG_COLORS'; payload: MtgColor[] }
  | { type: 'SET_MTG_RARITY'; payload: MtgRarity }
  | { type: 'SET_MTG_IMAGE'; payload: string | null }
  | { type: 'SET_MTG_KEYWORDS'; payload: MtgKeyword[] }
  | { type: 'SET_MTG_LOYALTY_ABILITIES'; payload: MtgLoyaltyAbility[] }
  | { type: 'SET_MTG_SAGA_CHAPTERS'; payload: MtgSagaChapter[] }
  | { type: 'SET_MTG_FIELD'; payload: { key: keyof MtgCardState; value: unknown } }
  | { type: 'LOAD_MTG_STATE'; payload: MtgCardState };
