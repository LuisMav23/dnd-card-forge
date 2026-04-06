export type CardType = 'spell' | 'armor' | 'equipment' | 'weapon' | 'sidekick' | 'anything';

export type ImageAspect = 'portrait' | 'square' | 'landscape';
export type CardFontSize = 'sm' | 'md' | 'lg';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';

export interface ThemeOption {
  key: string;
  bg: string;
  name: string;
}

export interface RarityOption {
  key: Rarity;
  color: string;
  border: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface CardTypeConfig {
  label: string;
  iconId: string;
  defaultIcon: string;
  defaultTheme: string;
  isSidekick?: boolean;
  icons: string[];
  themes: ThemeOption[];
  statLabels: [string, string, string, string];
  statDefaults: [string, string, string, string];
}

export interface CardState {
  type: CardType;
  rarity: Rarity;
  icon: string;
  image: string | null;
  /** Full-bleed background behind color wash; data URL (JPEG preferred). */
  backgroundTexture: string | null;
  /** Optional reverse-face art for print (same aspect as card shell). */
  backImage: string | null;
  /** Face gradient and chrome (#rrggbb). */
  colorBgFrom: string;
  colorBgTo: string;
  colorForeground: string;
  colorAccent: string;
  colorBorderOuter: string;
  colorBorderInner: string;
  fields: Record<string, string>;
  /** Controls the height/aspect of the art container. Default: 'square' (3:2 standard). */
  imageAspect: ImageAspect;
  /** Controls base text size inside the card. Default: 'md'. */
  fontSize: CardFontSize;
  /** Rarity gem pips in the card footer. Default: true. */
  showPips: boolean;
}

export type CardPalettePatch = Partial<
  Pick<
    CardState,
    | 'colorBgFrom'
    | 'colorBgTo'
    | 'colorForeground'
    | 'colorAccent'
    | 'colorBorderOuter'
    | 'colorBorderInner'
  >
>;

export type CardAction =
  | { type: 'SET_CARD_TYPE'; payload: CardType }
  | { type: 'SET_RARITY'; payload: Rarity }
  | { type: 'SET_ICON'; payload: string }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_BACKGROUND_TEXTURE'; payload: string | null }
  | { type: 'SET_BACK_IMAGE'; payload: string | null }
  | { type: 'SET_CARD_COLORS'; payload: CardPalettePatch }
  | { type: 'SET_FIELD'; payload: { key: string; value: string } }
  | { type: 'SET_FIELDS'; payload: Record<string, string> }
  | { type: 'SET_IMAGE_ASPECT'; payload: ImageAspect }
  | { type: 'SET_FONT_SIZE'; payload: CardFontSize }
  | { type: 'SET_SHOW_PIPS'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: CardState };

export interface TypebarResult {
  left: string;
  right: string;
}

export interface CostResult {
  value: string;
  label: string;
}
