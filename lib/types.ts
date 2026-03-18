export type CardType = 'spell' | 'armor' | 'equipment' | 'weapon' | 'sidekick' | 'anything';

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
  emoji: string;
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
  theme: string;
  rarity: Rarity;
  icon: string;
  image: string | null;
  fields: Record<string, string>;
}

export type CardAction =
  | { type: 'SET_CARD_TYPE'; payload: CardType }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_RARITY'; payload: Rarity }
  | { type: 'SET_ICON'; payload: string }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_FIELD'; payload: { key: string; value: string } }
  | { type: 'SET_FIELDS'; payload: Record<string, string> };

export interface TypebarResult {
  left: string;
  right: string;
}

export interface CostResult {
  value: string;
  label: string;
}
