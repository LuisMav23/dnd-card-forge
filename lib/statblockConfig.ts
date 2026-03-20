import { GameSystem, StatBlockType, StatBlockTypeConfig, Feature } from './statblockTypes';

/* ── Visual config (shared across systems) ── */

export const STATBLOCK_TYPES: Record<StatBlockType, StatBlockTypeConfig> = {
  adversary: {
    label: 'Adversary',
    emoji: '⚔️',
    defaultIcon: '💀',
    defaultTheme: 'blood',
    icons: ['💀','👹','🐉','👺','🧟','🕷️','🦂','🐍','🦇','👻','🧛','🗡️','🔥','⚡','🌑','🩸','☠️','🐺'],
    themes: [
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'Blood' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Flame' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'void', bg: 'linear-gradient(135deg,#b0a8b8,#504858)', name: 'Void' },
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
    ],
  },
  npc: {
    label: 'NPC',
    emoji: '🧑',
    defaultIcon: '🧙',
    defaultTheme: 'earth',
    icons: ['🧙','🧝','👤','🤴','👸','🧑‍🌾','🧑‍🔬','🧑‍⚕️','🧑‍🎨','🧑‍🍳','🧑‍🏫','🧑‍⚖️','🧑‍✈️','🥷','🤖','🧚'],
    themes: [
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'cosmic', bg: 'linear-gradient(135deg,#c0c8e8,#6068a8)', name: 'Cosmic' },
    ],
  },
  environment: {
    label: 'Environment',
    emoji: '🏔️',
    defaultIcon: '🌲',
    defaultTheme: 'nature',
    icons: ['🌲','🏔️','🌊','🏰','🌋','🏚️','⛪','🏛️','🌾','🌑','🔥','❄️','⚡','🌪️','🏜️','🪨','🌿','🕳️'],
    themes: [
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Flame' },
      { key: 'storm', bg: 'linear-gradient(135deg,#f0f0b0,#d8d840)', name: 'Storm' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'Blood' },
      { key: 'void', bg: 'linear-gradient(135deg,#b0a8b8,#504858)', name: 'Void' },
    ],
  },
};

/* ── Per-system type bar labels ── */

export const SYSTEM_TYPE_ORDER: Record<
  GameSystem,
  { type: StatBlockType; emoji: string; label: string }[]
> = {
  dnd: [
    { type: 'adversary', emoji: '🐉', label: 'Monster' },
    { type: 'npc', emoji: '🧑', label: 'NPC' },
    { type: 'environment', emoji: '⚠️', label: 'Hazard' },
  ],
  daggerheart: [
    { type: 'adversary', emoji: '⚔️', label: 'Adversary' },
    { type: 'npc', emoji: '🧑', label: 'NPC' },
    { type: 'environment', emoji: '🏔️', label: 'Environment' },
  ],
};

/* ── Daggerheart tier → difficulty ── */

const DH_TIER_DIFFICULTY: Record<string, string> = {
  '1': '11',
  '2': '14',
  '3': '17',
  '4': '20',
};

export function getTierDifficulty(tier: string): string {
  return DH_TIER_DIFFICULTY[tier] || '11';
}

/* ── Default fields per system + type ── */

export function getDefaultStatBlockFields(system: GameSystem, sbType: StatBlockType): Record<string, string> {
  if (system === 'dnd') return getDndDefaults(sbType);
  return getDaggerheartDefaults(sbType);
}

function getDaggerheartDefaults(sbType: StatBlockType): Record<string, string> {
  switch (sbType) {
    case 'adversary':
      return {
        name: '',
        tier: '1',
        atype: 'Standard',
        description: '',
        motives: '',
        difficulty: DH_TIER_DIFFICULTY['1'],
        hp: '6',
        stress: '2',
        thresholdMajor: '7',
        thresholdSevere: '13',
        atkMod: '+2',
        weaponName: 'Claws',
        atkRange: 'Melee',
        atkDamage: '1d8+2',
        dmgType: 'Physical',
        experience: '',
      };
    case 'npc':
      return {
        name: '',
        tier: '1',
        role: 'Merchant',
        description: '',
        motives: '',
        difficulty: DH_TIER_DIFFICULTY['1'],
        connections: '',
        traits: '',
      };
    case 'environment':
      return {
        name: '',
        tier: '1',
        etype: 'Exploration',
        description: '',
        impulses: '',
        difficulty: DH_TIER_DIFFICULTY['1'],
        potentialAdversaries: '',
        featureQuestions: '',
      };
  }
}

function getDndDefaults(sbType: StatBlockType): Record<string, string> {
  switch (sbType) {
    case 'adversary':
      return {
        name: '',
        size: 'Medium',
        creatureType: 'Beast',
        alignment: 'Unaligned',
        ac: '13',
        acSource: 'natural armor',
        hp: '27',
        hpDice: '5d8+5',
        speed: '30 ft.',
        str: '14', dex: '12', con: '13', int: '2', wis: '10', cha: '5',
        savingThrows: '',
        skills: '',
        damageResistances: '',
        damageImmunities: '',
        conditionImmunities: '',
        senses: 'passive Perception 10',
        languages: '—',
        cr: '1',
        xp: '200',
        description: '',
      };
    case 'npc':
      return {
        name: '',
        race: 'Human',
        classOccupation: 'Commoner',
        alignment: 'Neutral',
        ac: '10',
        acSource: '',
        hp: '4',
        hpDice: '1d8',
        speed: '30 ft.',
        str: '10', dex: '10', con: '10', int: '10', wis: '10', cha: '10',
        skills: '',
        senses: 'passive Perception 10',
        languages: 'Common',
        cr: '0',
        xp: '10',
        description: '',
      };
    case 'environment':
      return {
        name: '',
        hazardType: 'Trap',
        trigger: '',
        effect: '',
        saveDC: '13',
        saveAbility: 'Dexterity',
        damage: '2d10',
        damageType: 'Piercing',
        description: '',
        countermeasures: '',
      };
  }
}

/* ── Default features per system + type ── */

export function getDefaultFeatures(system: GameSystem, sbType: StatBlockType): Feature[] {
  if (system === 'dnd') return getDndDefaultFeatures(sbType);
  return getDaggerheartDefaultFeatures(sbType);
}

function getDaggerheartDefaultFeatures(sbType: StatBlockType): Feature[] {
  switch (sbType) {
    case 'adversary':
      return [
        { id: crypto.randomUUID(), kind: 'passive', name: 'Tough Hide', description: 'Reduces physical damage by 1.' },
      ];
    case 'npc':
      return [
        { id: crypto.randomUUID(), kind: 'passive', name: 'Local Knowledge', description: 'Can provide information about the surrounding area.' },
      ];
    case 'environment':
      return [
        { id: crypto.randomUUID(), kind: 'action', name: 'Hazard', description: 'A hidden danger threatens those who pass through.' },
      ];
  }
}

function getDndDefaultFeatures(sbType: StatBlockType): Feature[] {
  switch (sbType) {
    case 'adversary':
      return [
        { id: crypto.randomUUID(), kind: 'passive', name: 'Keen Senses', description: 'Advantage on Wisdom (Perception) checks that rely on sight, hearing, or smell.' },
      ];
    case 'npc':
      return [];
    case 'environment':
      return [];
  }
}
