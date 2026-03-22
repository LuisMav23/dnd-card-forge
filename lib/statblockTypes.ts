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
  defaultTheme: string;
  icons: string[];
  themes: ThemeOption[];
}

export interface StatBlockState {
  system: GameSystem;
  type: StatBlockType;
  theme: string;
  icon: string;
  image: string | null;
  fields: Record<string, string>;
  features: Feature[];
}

export type StatBlockAction =
  | { type: 'SET_SYSTEM'; payload: GameSystem }
  | { type: 'SET_STATBLOCK_TYPE'; payload: StatBlockType }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_ICON'; payload: string }
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_FIELD'; payload: { key: string; value: string } }
  | { type: 'SET_FIELDS'; payload: Record<string, string> }
  | { type: 'ADD_FEATURE'; payload: Feature }
  | { type: 'UPDATE_FEATURE'; payload: Feature }
  | { type: 'REMOVE_FEATURE'; payload: string }
  | { type: 'LOAD_STATE'; payload: StatBlockState };
