/** Preset labels for onboarding tile grids (user selections stored as these strings). */

export const PRESET_GAMES = [
  'D&D 5e',
  'D&D 2024 / One D&D',
  'Pathfinder 2e',
  'Pathfinder 1e',
  'Call of Cthulhu',
  'Shadowdark',
  'Mörk Borg',
  'OSR / Old-school',
  'Warhammer Fantasy',
  'Warhammer 40k RPG',
  'Cyberpunk RED',
  'Starfinder',
  'Vampire: The Masquerade',
  'Board games',
  'LARP',
  'Other',
] as const;

export const PRESET_MEDIA_MOVIES = [
  'Lord of the Rings',
  'The Hobbit',
  'Game of Thrones / House of the Dragon',
  'The Witcher',
  'Dungeons & Dragons: Honor Among Thieves',
  'Critical Role (shows)',
  'Willow',
  'Conan / Barbarian fantasy',
  'Dark fantasy (e.g. Berserk-inspired)',
  'Sci-fi TTRPG films',
  'Other',
] as const;

export const PRESET_MEDIA_NOVELS = [
  'Forgotten Realms / Drizzt',
  'Dragonlance',
  'Mistborn / Cosmere',
  'The Wheel of Time',
  'Malazan',
  'Discworld',
  'Earthsea',
  'Narnia',
  'The Kingkiller Chronicle',
  'Grimdark / Joe Abercrombie',
  'LitRPG',
  'Other',
] as const;

export const PRESET_WORLDS = [
  'Forgotten Realms',
  'Greyhawk',
  'Eberron',
  'Ravenloft',
  'Middle-earth',
  'Westeros',
  'Exandria (Critical Role)',
  'Golarion (Pathfinder)',
  'Homebrew only',
  'Multiple settings',
  'Other',
] as const;

export const PRIMARY_USE_LABELS: Record<string, string> = {
  player_cards: 'Make player-facing item cards',
  dm_tools: 'DM tools & reference at the table',
  stat_blocks: 'Stat blocks & monsters',
  explore_publish: 'Publish and browse the Explore gallery',
  learning: 'Learning the hobby',
  other: 'Something else',
};
