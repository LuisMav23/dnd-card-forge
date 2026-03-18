'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function WeaponFields({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>⚔️ Weapon Identity</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Weapon Name</label>
          <input type="text" placeholder="e.g. Vorpal Blade of Ruin" maxLength={28}
            value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="fg">
          <label>Magic Bonus</label>
          <select value={fields.cost || '+1'} onChange={e => onChange('cost', e.target.value)}>
            <option value="+0">+0 (Mundane)</option>
            <option value="+1">+1</option>
            <option value="+2">+2</option>
            <option value="+3">+3</option>
          </select>
        </div>
      </div>
      <div className="frow c3">
        <div className="fg">
          <label>Weapon Type</label>
          <select value={fields.wtype || 'Longsword'} onChange={e => onChange('wtype', e.target.value)}>
            {['Longsword','Shortsword','Dagger','Greataxe','Greatsword','Handaxe','Rapier','Warhammer','Shortbow','Longbow','Crossbow','Quarterstaff','Spear','Trident','Flail','Scimitar','Whip'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Damage Type</label>
          <select value={fields.dmg || 'Slashing'} onChange={e => onChange('dmg', e.target.value)}>
            {['Slashing','Piercing','Bludgeoning','Fire','Cold','Lightning','Necrotic','Radiant','Psychic','Poison','Acid','Thunder','Force'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Properties</label>
          <select value={fields.prop || 'Versatile'} onChange={e => onChange('prop', e.target.value)}>
            {['Versatile','Finesse','Two-Handed','Light, Thrown','Heavy, Reach','Ranged','Loading','Special','Thrown','Reach'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Usable By</label>
          <input type="text" placeholder="e.g. Any · Requires Attunement" maxLength={55}
            value={fields.class || ''} onChange={e => onChange('class', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
