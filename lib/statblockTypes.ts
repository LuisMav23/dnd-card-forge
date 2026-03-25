import type { CardPalette } from './cardPalette';

export type GameSystem = 'dnd' | 'daggerheart';

export type StatBlockType = 'adversary' | 'npc' | 'environment';

export type FeatureKind = 'action' | 'passive' | 'reaction';

export interface Feature {
  id: string;
  kind: FeatureKind;
  name: string;
  description: string;
}

export interface ThemeOption {
  key: string;
  bg: string;
  name: string;
}

export interface StatBlockTypeConfig {
  label: string;
  emoji: string;
  defaultIcon: string;
  /** Legacy preset key; used only to seed default colors for new / type-switched blocks. */
  defaultTheme: string;
  icons: string[];
  themes: ThemeOption[];
}

export interface StatBlockState extends CardPalette {
  system: GameSystem;
  type: StatBlockType;
  icon: string;
  image: string | null;
  fields: Record<string, string>;
  features: Feature[];
}

export type StatBlockAction =
  | { type: 'SET_SYSTEM'; payload: GameSystem }
  | { type: 'SET_STATBLOCK_TYPE'; payload: StatBlockType }
  | { type: 'SET_STATBLOCK_COLORS'; payload: Partial<CardPalette> }
  | { type: 'SET_ICON'; payload: string }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_FIELD'; payload: { key: string; value: string } }
  | { type: 'SET_FIELDS'; payload: Record<string, string> }
  | { type: 'ADD_FEATURE'; payload: Feature }
  | { type: 'UPDATE_FEATURE'; payload: Feature }
  | { type: 'REMOVE_FEATURE'; payload: string }
  | { type: 'LOAD_STATE'; payload: StatBlockState };
