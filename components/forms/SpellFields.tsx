'use client';

import IconDisplay from '@/components/IconDisplay';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const SCHOOL_OPTIONS: { iconId: string; label: string }[] = [
  { iconId: 'sparkles', label: 'Arcane' },
  { iconId: 'bomb', label: 'Evocation' },
  { iconId: 'loader', label: 'Conjuration' },
  { iconId: 'orbit', label: 'Divination' },
  { iconId: 'wand', label: 'Transmutation' },
  { iconId: 'shield', label: 'Abjuration' },
  { iconId: 'skull', label: 'Necromancy' },
  { iconId: 'eye', label: 'Illusion' },
  { iconId: 'leaf', label: 'Druidic' },
  { iconId: 'sun', label: 'Divine' },
  { iconId: 'moon', label: 'Shadow' },
  { iconId: 'droplets', label: 'Blood' },
  { iconId: 'zap', label: 'Storm' },
];

export default function SpellFields({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3><IconDisplay iconId="sparkles" className="inline-block h-4 w-4 align-[-2px]" /> Spell Identity</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Spell Name</label>
          <input type="text" placeholder="e.g. Arcane Rift" maxLength={28}
            value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="fg">
          <label>Spell Slot</label>
          <select value={fields.cost || '7'} onChange={e => onChange('cost', e.target.value)}>
            <option value="0">Cantrip (0)</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
            <option value="4">4th</option>
            <option value="5">5th</option>
            <option value="6">6th</option>
            <option value="7">7th</option>
            <option value="8">8th</option>
            <option value="9">9th</option>
          </select>
        </div>
      </div>
      <div className="frow c3">
        <div className="fg">
          <label>Spell Category</label>
          <select value={fields.sptype || 'Spell'} onChange={e => onChange('sptype', e.target.value)}>
            {['Spell', 'Ritual', 'Cantrip', 'Invocation', 'Pact Magic'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>School of Magic</label>
          <select value={fields.school || 'Arcane'} onChange={e => onChange('school', e.target.value)}>
            {SCHOOL_OPTIONS.map(s => (
              <option key={s.label} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Action Type</label>
          <select value={fields.action || 'Action'} onChange={e => onChange('action', e.target.value)}>
            {['Action', 'Bonus Action', 'Reaction', 'Full Turn', 'Ritual (10 min)', 'Passive'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Available to (Classes)</label>
          <input type="text" placeholder="e.g. Wizard · Sorcerer · Warlock" maxLength={55}
            value={fields.class || ''} onChange={e => onChange('class', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
