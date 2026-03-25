import type { StatBlockState } from './statblockTypes';
import { SYSTEM_TYPE_ORDER } from './statblockConfig';

export function getStatBlockWikiSystemLabel(system: StatBlockState['system']): string {
  return system === 'dnd' ? 'D&D 5e' : 'Daggerheart';
}

export function getStatBlockWikiTypeLabel(state: StatBlockState): string {
  const order = SYSTEM_TYPE_ORDER[state.system];
  const found = order.find(t => t.type === state.type);
  return found ? `${found.emoji} ${found.label}` : state.type;
}

export function getStatBlockWikiSubtypeLine(state: StatBlockState): string {
  const f = state.fields;
  if (state.system === 'daggerheart') {
    if (state.type === 'adversary') return `${f.atype || 'Standard'} Adversary`;
    if (state.type === 'npc') return f.role || 'NPC';
    return f.etype || 'Exploration';
  }
  if (state.type === 'adversary') {
    return `${f.size || 'Medium'} ${(f.creatureType || 'beast').toLowerCase()}, ${(f.alignment || 'unaligned').toLowerCase()}`;
  }
  if (state.type === 'npc') {
    return `${f.race || 'Human'} ${f.classOccupation || 'Commoner'}, ${(f.alignment || 'neutral').toLowerCase()}`;
  }
  return f.hazardType || 'Trap';
}

export interface WikiStatRow {
  label: string;
  value: string;
}

/** Primary stat grid for wiki (subset of block; full detail in preview). */
export function getStatBlockWikiPrimaryStats(state: StatBlockState): WikiStatRow[] {
  const f = state.fields;
  if (state.system === 'daggerheart') {
    if (state.type === 'adversary') {
      return [
        { label: 'Tier', value: f.tier || '1' },
        { label: 'Difficulty', value: f.difficulty || '—' },
        { label: 'HP', value: f.hp || '—' },
        { label: 'Stress', value: f.stress || '—' },
        { label: 'Atk mod', value: f.atkMod || '—' },
        { label: 'Major / Severe', value: `${f.thresholdMajor || '—'} / ${f.thresholdSevere || '—'}` },
      ];
    }
    if (state.type === 'npc') {
      return [
        { label: 'Tier', value: f.tier || '1' },
        { label: 'Difficulty', value: f.difficulty || '—' },
        { label: 'Role', value: f.role || '—' },
      ];
    }
    return [
      { label: 'Tier', value: f.tier || '1' },
      { label: 'Difficulty', value: f.difficulty || '—' },
      { label: 'Type', value: f.etype || '—' },
    ];
  }

  if (state.type === 'adversary') {
    const ac = f.acSource ? `${f.ac || '10'} (${f.acSource})` : f.ac || '10';
    const hp = f.hpDice ? `${f.hp || '1'} (${f.hpDice})` : f.hp || '1';
    return [
      { label: 'Armor class', value: ac },
      { label: 'Hit points', value: hp },
      { label: 'Speed', value: f.speed || '—' },
      { label: 'Challenge', value: `${f.cr || '0'} (${f.xp || '0'} XP)` },
    ];
  }
  if (state.type === 'npc') {
    const ac = f.acSource ? `${f.ac || '10'} (${f.acSource})` : f.ac || '10';
    const hp = f.hpDice ? `${f.hp || '1'} (${f.hpDice})` : f.hp || '1';
    return [
      { label: 'Armor class', value: ac },
      { label: 'Hit points', value: hp },
      { label: 'Speed', value: f.speed || '—' },
      { label: 'Challenge', value: `${f.cr || '0'} (${f.xp || '0'} XP)` },
    ];
  }
  return [
    { label: 'Save DC', value: f.saveDC || '—' },
    { label: 'Save', value: f.saveAbility || '—' },
    { label: 'Damage', value: f.damage ? `${f.damage} ${f.damageType || ''}`.trim() : '—' },
    { label: 'Trigger', value: f.trigger || '—' },
  ];
}

export interface WikiNarrativeSection {
  title: string;
  body: string;
}

export function getStatBlockWikiNarrativeSections(state: StatBlockState): WikiNarrativeSection[] {
  const f = state.fields;
  const sections: WikiNarrativeSection[] = [];

  const push = (title: string, body: string | undefined) => {
    const t = body?.trim();
    if (t) sections.push({ title, body: t });
  };

  if (state.system === 'daggerheart') {
    if (state.type === 'adversary') {
      const atk = [f.weaponName, f.atkRange, f.atkDamage, f.dmgType].some(Boolean);
      if (atk) {
        sections.push({
          title: 'Attack',
          body: `${f.weaponName || 'Attack'} — ${f.atkRange || 'Melee'} | ${f.atkDamage || '—'} ${(f.dmgType || '').toLowerCase()} damage`.trim(),
        });
      }
      push('Motives & tactics', f.motives);
      push('Experience', f.experience);
    } else if (state.type === 'npc') {
      push('Motives', f.motives);
      push('Connections', f.connections);
      push('Notable traits', f.traits);
    } else {
      push('Impulses', f.impulses);
      push('Potential adversaries', f.potentialAdversaries);
      push('Feature questions', f.featureQuestions);
    }
  } else {
    if (state.type === 'environment') {
      push('Effect', f.effect);
      push('Countermeasures', f.countermeasures);
    } else if (state.type === 'npc') {
      const lines: string[] = [];
      if (f.skills?.trim()) lines.push(`Skills: ${f.skills}`);
      if (f.senses?.trim()) lines.push(`Senses: ${f.senses}`);
      if (f.languages?.trim()) lines.push(`Languages: ${f.languages}`);
      if (lines.length) sections.push({ title: 'Details', body: lines.join('\n') });
    } else {
      const lines: string[] = [];
      if (f.savingThrows?.trim()) lines.push(`Saving throws: ${f.savingThrows}`);
      if (f.skills?.trim()) lines.push(`Skills: ${f.skills}`);
      if (f.damageResistances?.trim()) lines.push(`Damage resistances: ${f.damageResistances}`);
      if (f.damageImmunities?.trim()) lines.push(`Damage immunities: ${f.damageImmunities}`);
      if (f.conditionImmunities?.trim()) lines.push(`Condition immunities: ${f.conditionImmunities}`);
      if (f.senses?.trim()) lines.push(`Senses: ${f.senses}`);
      if (f.languages?.trim()) lines.push(`Languages: ${f.languages}`);
      if (lines.length) sections.push({ title: 'Monster details', body: lines.join('\n') });
    }
  }

  return sections;
}
