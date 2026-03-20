'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const HAZARD_TYPES = ['Trap', 'Terrain', 'Lair', 'Environmental', 'Magical'];
const SAVE_ABILITIES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
const DAMAGE_TYPES = [
  'Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning',
  'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder',
];

export default function DndEnvironmentFields({ fields, onChange }: Props) {
  return (
    <>
      <div className="fsec">
        <h3>⚠️ Hazard Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Pit Trap" maxLength={32}
              value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div className="fg">
            <label>Hazard Type</label>
            <select value={fields.hazardType || 'Trap'} onChange={e => onChange('hazardType', e.target.value)}>
              {HAZARD_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Description</label>
            <textarea placeholder="What does this hazard look like?"
              value={fields.description || ''} onChange={e => onChange('description', e.target.value)}
              rows={2} maxLength={200} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>🎯 Mechanics</h3>
        <div className="frow c1">
          <div className="fg">
            <label>Trigger</label>
            <textarea placeholder="What activates this hazard?"
              value={fields.trigger || ''} onChange={e => onChange('trigger', e.target.value)}
              rows={2} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Effect</label>
            <textarea placeholder="What happens when triggered?"
              value={fields.effect || ''} onChange={e => onChange('effect', e.target.value)}
              rows={2} />
          </div>
        </div>
        <div className="frow c3">
          <div className="fg">
            <label>Save DC</label>
            <input type="text" placeholder="13"
              value={fields.saveDC || ''} onChange={e => onChange('saveDC', e.target.value)} />
          </div>
          <div className="fg">
            <label>Save Ability</label>
            <select value={fields.saveAbility || 'Dexterity'} onChange={e => onChange('saveAbility', e.target.value)}>
              {SAVE_ABILITIES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Damage</label>
            <input type="text" placeholder="2d10"
              value={fields.damage || ''} onChange={e => onChange('damage', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Damage Type</label>
            <select value={fields.damageType || 'Piercing'} onChange={e => onChange('damageType', e.target.value)}>
              {DAMAGE_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>🔧 Countermeasures</h3>
        <div className="frow c1">
          <div className="fg">
            <label>Countermeasures</label>
            <textarea placeholder="How can this hazard be detected, avoided, or disarmed?"
              value={fields.countermeasures || ''} onChange={e => onChange('countermeasures', e.target.value)}
              rows={3} />
          </div>
        </div>
      </div>
    </>
  );
}
