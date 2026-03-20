'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

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

export default function DndNpcFields({ fields, onChange }: Props) {
  return (
    <>
      <div className="fsec">
        <h3>🧑 NPC Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Captain Elara" maxLength={32}
              value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div className="fg">
            <label>Race</label>
            <input type="text" placeholder="Human"
              value={fields.race || ''} onChange={e => onChange('race', e.target.value)} />
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Class / Occupation</label>
            <input type="text" placeholder="Commoner"
              value={fields.classOccupation || ''} onChange={e => onChange('classOccupation', e.target.value)} />
          </div>
          <div className="fg">
            <label>Alignment</label>
            <select value={fields.alignment || 'Neutral'} onChange={e => onChange('alignment', e.target.value)}>
              {ALIGNMENTS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Description</label>
            <textarea placeholder="Brief appearance and demeanor…"
              value={fields.description || ''} onChange={e => onChange('description', e.target.value)}
              rows={2} maxLength={200} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>🛡️ Combat Stats</h3>
        <div className="frow c3">
          <div className="fg">
            <label>Armor Class</label>
            <input type="text" placeholder="10"
              value={fields.ac || ''} onChange={e => onChange('ac', e.target.value)} />
          </div>
          <div className="fg">
            <label>AC Source</label>
            <input type="text" placeholder="leather armor"
              value={fields.acSource || ''} onChange={e => onChange('acSource', e.target.value)} />
          </div>
          <div className="fg">
            <label>Challenge Rating</label>
            <input type="text" placeholder="0"
              value={fields.cr || ''} onChange={e => onChange('cr', e.target.value)} />
          </div>
        </div>
        <div className="frow c3">
          <div className="fg">
            <label>Hit Points</label>
            <input type="text" placeholder="4"
              value={fields.hp || ''} onChange={e => onChange('hp', e.target.value)} />
          </div>
          <div className="fg">
            <label>HP Dice</label>
            <input type="text" placeholder="1d8"
              value={fields.hpDice || ''} onChange={e => onChange('hpDice', e.target.value)} />
          </div>
          <div className="fg">
            <label>XP</label>
            <input type="text" placeholder="10"
              value={fields.xp || ''} onChange={e => onChange('xp', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Speed</label>
            <input type="text" placeholder="30 ft."
              value={fields.speed || ''} onChange={e => onChange('speed', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>📊 Ability Scores</h3>
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
        <h3>📋 Properties</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Skills</label>
            <input type="text" placeholder="Persuasion +4"
              value={fields.skills || ''} onChange={e => onChange('skills', e.target.value)} />
          </div>
          <div className="fg">
            <label>Senses</label>
            <input type="text" placeholder="passive Perception 10"
              value={fields.senses || ''} onChange={e => onChange('senses', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Languages</label>
            <input type="text" placeholder="Common"
              value={fields.languages || ''} onChange={e => onChange('languages', e.target.value)} />
          </div>
        </div>
      </div>
    </>
  );
}
