'use client';

import { BarChart3, ClipboardList } from 'lucide-react';
import IconDisplay from '@/components/IconDisplay';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
const CREATURE_TYPES = [
  'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental',
  'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead',
];
const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  'Unaligned',
];
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const ABILITY_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
};

export default function DndMonsterFields({ fields, onChange }: Props) {
  return (
    <>
      <div className="fsec">
        <h3><IconDisplay iconId="dragon" className="inline-block h-4 w-4 align-[-2px]" /> Monster Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Dire Wolf" maxLength={32}
              value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div className="fg">
            <label>Size</label>
            <select value={fields.size || 'Medium'} onChange={e => onChange('size', e.target.value)}>
              {SIZES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Creature Type</label>
            <select value={fields.creatureType || 'Beast'} onChange={e => onChange('creatureType', e.target.value)}>
              {CREATURE_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Alignment</label>
            <select value={fields.alignment || 'Unaligned'} onChange={e => onChange('alignment', e.target.value)}>
              {ALIGNMENTS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Description</label>
            <textarea placeholder="Brief flavor text (optional)…"
              value={fields.description || ''} onChange={e => onChange('description', e.target.value)}
              rows={2} maxLength={200} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3><IconDisplay iconId="shield" className="inline-block h-4 w-4 align-[-2px]" /> Combat Stats</h3>
        <div className="frow c3">
          <div className="fg">
            <label>Armor Class</label>
            <input type="text" placeholder="13"
              value={fields.ac || ''} onChange={e => onChange('ac', e.target.value)} />
          </div>
          <div className="fg">
            <label>AC Source</label>
            <input type="text" placeholder="natural armor"
              value={fields.acSource || ''} onChange={e => onChange('acSource', e.target.value)} />
          </div>
          <div className="fg">
            <label>Challenge Rating</label>
            <input type="text" placeholder="1"
              value={fields.cr || ''} onChange={e => onChange('cr', e.target.value)} />
          </div>
        </div>
        <div className="frow c3">
          <div className="fg">
            <label>Hit Points</label>
            <input type="text" placeholder="27"
              value={fields.hp || ''} onChange={e => onChange('hp', e.target.value)} />
          </div>
          <div className="fg">
            <label>HP Dice</label>
            <input type="text" placeholder="5d8+5"
              value={fields.hpDice || ''} onChange={e => onChange('hpDice', e.target.value)} />
          </div>
          <div className="fg">
            <label>XP</label>
            <input type="text" placeholder="200"
              value={fields.xp || ''} onChange={e => onChange('xp', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Speed</label>
            <input type="text" placeholder="30 ft., fly 60 ft."
              value={fields.speed || ''} onChange={e => onChange('speed', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>
          <BarChart3 className="inline-block h-4 w-4 align-[-2px]" /> Ability Scores
        </h3>
        <div className="frow c6">
          {ABILITY_KEYS.map(k => (
            <div className="fg" key={k}>
              <label>{ABILITY_LABELS[k]}</label>
              <input type="text" placeholder="10"
                value={fields[k] || ''} onChange={e => onChange(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="fsec">
        <h3>
          <ClipboardList className="inline-block h-4 w-4 align-[-2px]" /> Properties
        </h3>
        <div className="frow c2">
          <div className="fg">
            <label>Saving Throws</label>
            <input type="text" placeholder="Dex +3, Con +2"
              value={fields.savingThrows || ''} onChange={e => onChange('savingThrows', e.target.value)} />
          </div>
          <div className="fg">
            <label>Skills</label>
            <input type="text" placeholder="Perception +3, Stealth +4"
              value={fields.skills || ''} onChange={e => onChange('skills', e.target.value)} />
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Damage Resistances</label>
            <input type="text" placeholder="fire, bludgeoning"
              value={fields.damageResistances || ''} onChange={e => onChange('damageResistances', e.target.value)} />
          </div>
          <div className="fg">
            <label>Damage Immunities</label>
            <input type="text" placeholder="poison"
              value={fields.damageImmunities || ''} onChange={e => onChange('damageImmunities', e.target.value)} />
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Condition Immunities</label>
            <input type="text" placeholder="poisoned, frightened"
              value={fields.conditionImmunities || ''} onChange={e => onChange('conditionImmunities', e.target.value)} />
          </div>
          <div className="fg">
            <label>Senses</label>
            <input type="text" placeholder="darkvision 60 ft., passive Perception 13"
              value={fields.senses || ''} onChange={e => onChange('senses', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Languages</label>
            <input type="text" placeholder="Common, Draconic"
              value={fields.languages || ''} onChange={e => onChange('languages', e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );
}
