import { CardType, CardTypeConfig } from './types';

export const CARD_TYPES: Record<CardType, CardTypeConfig> = {
  spell: {
    label: 'Spell',
    iconId: 'sparkles',
    defaultIcon: 'loader',
    defaultTheme: 'arcane',
    icons: ['loader','bomb','flame','snowflake','zap','skull','sparkles','leaf','shield','eye','moon','sun','skull','wind','droplets','orbit','sparkle','waves'],
    themes: [
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Fire' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'storm', bg: 'linear-gradient(135deg,#f0f0b0,#d8d840)', name: 'Storm' },
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'Blood' },
    ],
    statLabels: ['Range', 'Duration', 'Damage', 'Save DC'],
    statDefaults: ['60 ft', '1 min', '8d10', '18'],
  },

  armor: {
    label: 'Armor',
    iconId: 'shield',
    defaultIcon: 'shield',
    defaultTheme: 'iron',
    icons: ['shield','wrench','hammer','shield-half','link','gem','star','key','hexagon','landmark','sword','shield-check','loader','swords'],
    themes: [
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Infernal' },
      { key: 'cosmic', bg: 'linear-gradient(135deg,#c0c8e8,#6068a8)', name: 'Cosmic' },
    ],
    statLabels: ['Stealth', 'Str Req.', 'Wt (lbs)', 'Value'],
    statDefaults: ['Disadv.', '15', '65', '1,500gp'],
  },

  equipment: {
    label: 'Equipment',
    iconId: 'backpack',
    defaultIcon: 'backpack',
    defaultTheme: 'earth',
    icons: ['backpack','test-tube','scroll-text','orbit','circle-dot','hexagon','flame','key-round','circle-dashed','eye','wand','target','magnet','flask','coins','map','key','package'],
    themes: [
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Infernal' },
    ],
    statLabels: ['Weight', 'Value', 'Recharge', 'Dmg/Heal'],
    statDefaults: ['0.5 lb', '500 gp', 'Dawn', '2d4+2'],
  },

  weapon: {
    label: 'Weapon',
    iconId: 'swords',
    defaultIcon: 'swords',
    defaultTheme: 'blood',
    icons: ['swords','sword','target','axe','anchor','hammer','zap','flame','loader','skull','droplets','rotate-ccw','scorpion','dragon','moon','shield'],
    themes: [
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'Blood' },
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Flame' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'storm', bg: 'linear-gradient(135deg,#f0f0b0,#d8d840)', name: 'Storm' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'void', bg: 'linear-gradient(135deg,#b0a8b8,#504858)', name: 'Void' },
    ],
    statLabels: ['Damage', 'Range', 'Weight', 'Value'],
    statDefaults: ['1d8+1', '5 ft', '3 lb', '750 gp'],
  },

  sidekick: {
    label: 'Sidekick',
    iconId: 'user-round',
    defaultIcon: 'wand',
    defaultTheme: 'earth',
    isSidekick: true,
    icons: ['wand','dragon','eagle','wolf','lion','elf','demon','zombie','bot','fairy','bear','fox','owl','boar','user','vampire'],
    themes: [
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'War' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'cosmic', bg: 'linear-gradient(135deg,#c0c8e8,#6068a8)', name: 'Cosmic' },
    ],
    statLabels: ['HP', 'AC', 'Speed', 'Init'],
    statDefaults: ['45', '14', '30 ft', '+3'],
  },

  anything: {
    label: 'Anything',
    iconId: 'loader',
    defaultIcon: 'loader',
    defaultTheme: 'arcane',
    icons: ['loader','bomb','flame','snowflake','zap','skull','sparkles','leaf','shield','eye','moon','sun','skull','wind','droplets','orbit','sparkle','waves','backpack','sword','target','axe','anchor','hammer','test-tube','scroll-text','circle-dot','flame','key-round','wand','dragon','eagle','wolf','rainbow','drama','tent'],
    themes: [
      { key: 'arcane', bg: 'linear-gradient(135deg,#e8d4f0,#c4a0d8)', name: 'Arcane' },
      { key: 'fire', bg: 'linear-gradient(135deg,#f5d5b0,#e8a870)', name: 'Fire' },
      { key: 'nature', bg: 'linear-gradient(135deg,#c8e8c0,#90c878)', name: 'Nature' },
      { key: 'divine', bg: 'linear-gradient(135deg,#f5f0c8,#e8d870)', name: 'Divine' },
      { key: 'shadow', bg: 'linear-gradient(135deg,#c0b8d0,#8888a8)', name: 'Shadow' },
      { key: 'frost', bg: 'linear-gradient(135deg,#c8e0f5,#90b8d8)', name: 'Frost' },
      { key: 'storm', bg: 'linear-gradient(135deg,#f0f0b0,#d8d840)', name: 'Storm' },
      { key: 'blood', bg: 'linear-gradient(135deg,#f0c8c8,#d88080)', name: 'Blood' },
      { key: 'iron', bg: 'linear-gradient(135deg,#ddd8d0,#909890)', name: 'Iron' },
      { key: 'earth', bg: 'linear-gradient(135deg,#e0d0b0,#a88848)', name: 'Earth' },
      { key: 'cosmic', bg: 'linear-gradient(135deg,#c0c8e8,#6068a8)', name: 'Cosmic' },
      { key: 'void', bg: 'linear-gradient(135deg,#b0a8b8,#504858)', name: 'Void' },
    ],
    statLabels: ['Stat 1', 'Stat 2', 'Stat 3', 'Stat 4'],
    statDefaults: ['—', '—', '—', '—'],
  },
};

export const CARD_TYPE_ORDER: { type: CardType; iconId: string; label: string }[] = [
  { type: 'spell', iconId: 'sparkles', label: 'Spell' },
  { type: 'armor', iconId: 'shield', label: 'Armor' },
  { type: 'equipment', iconId: 'backpack', label: 'Equipment' },
  { type: 'weapon', iconId: 'swords', label: 'Weapon' },
  { type: 'sidekick', iconId: 'user-round', label: 'Sidekick' },
  { type: 'anything', iconId: 'loader', label: 'Anything' },
];

export function getDefaultFields(cardType: CardType): Record<string, string> {
  const cfg = CARD_TYPES[cardType];
  const base: Record<string, string> = {
    name: '',
    flavor: '',
    desc: '',
    sl0: cfg.statLabels[0],
    sl1: cfg.statLabels[1],
    sl2: cfg.statLabels[2],
    sl3: cfg.statLabels[3],
    sv0: cfg.statDefaults[0],
    sv1: cfg.statDefaults[1],
    sv2: cfg.statDefaults[2],
    sv3: cfg.statDefaults[3],
  };

  switch (cardType) {
    case 'spell':
      return { ...base, cost: '7', sptype: 'Spell', school: 'Arcane', action: 'Action', class: '' };
    case 'armor':
      return { ...base, cost: '16', atype: 'Heavy Armor', mat: 'Steel', att: 'Yes', class: '' };
    case 'equipment':
      return { ...base, cost: '3', cat: 'Potion', trig: 'Action', att: 'No', class: '' };
    case 'weapon':
      return { ...base, cost: '+1', wtype: 'Longsword', dmg: 'Slashing', prop: 'Versatile', class: '' };
    case 'sidekick':
      return { ...base, cost: '1', ctype: 'Humanoid', role: 'Expert', align: 'Lawful Good', str: '10', dex: '14', con: '12', int: '10', wis: '13', cha: '11' };
    case 'anything':
      return { ...base, cost: '—', tl: '', tr: '', class: '' };
  }
}

export function getTypebar(cardType: CardType, fields: Record<string, string>): { left: string; right: string } {
  const f = (k: string) => fields[k] || '';
  switch (cardType) {
    case 'spell': {
      const t = f('sptype') || 'Spell';
      const sch = f('school') || 'Arcane';
      const a = f('action') || 'Action';
      return { left: `${t} — ${sch} · ${a}`, right: sch };
    }
    case 'armor': {
      const at = f('atype') || 'Heavy Armor';
      const m = f('mat') || 'Steel';
      const att = f('att') || 'No';
      return { left: `${at} — ${m}${att !== 'No' ? ' · ' + att : ''}`, right: 'Armor' };
    }
    case 'equipment': {
      const c = f('cat') || 'Wondrous Item';
      const t = f('trig') || 'Action';
      const att = f('att') || 'No';
      return { left: `${c} · ${t}${att !== 'No' ? ' · Attunement' : ''}`, right: 'Equipment' };
    }
    case 'weapon': {
      const w = f('wtype') || 'Longsword';
      const d = f('dmg') || 'Slashing';
      const p = f('prop') || 'Versatile';
      return { left: `${w} — ${d} · ${p}`, right: 'Weapon' };
    }
    case 'sidekick': {
      const c = f('ctype') || 'Humanoid';
      const r = f('role') || 'Expert';
      const al = f('align') || 'Neutral Good';
      return { left: `${c} · ${r}`, right: al };
    }
    case 'anything':
      return { left: f('tl') || 'Custom Card · Active', right: f('tr') || 'Creation' };
  }
}

export function getCost(cardType: CardType, fields: Record<string, string>): { value: string; label: string } {
  const v = fields.cost || '';
  switch (cardType) {
    case 'spell': return { value: v || '7', label: 'SP' };
    case 'armor': return { value: v || '16', label: 'AC' };
    case 'equipment': return { value: v || '3', label: 'Uses' };
    case 'weapon': return { value: v || '+1', label: 'Bonus' };
    case 'sidekick': return { value: v || '1', label: 'CR' };
    case 'anything': return { value: v || '—', label: '' };
  }
}
