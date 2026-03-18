'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function EquipmentFields({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>🎒 Item Identity</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Item Name</label>
          <input type="text" placeholder="e.g. Potion of Giant Strength" maxLength={28}
            value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="fg">
          <label>Charges / Uses</label>
          <select value={fields.cost || '3'} onChange={e => onChange('cost', e.target.value)}>
            {['∞','1','2','3','4','5','6','7','8','10'].map(v => (
              <option key={v} value={v}>{v === '∞' ? 'Unlimited' : v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="frow c3">
        <div className="fg">
          <label>Item Category</label>
          <select value={fields.cat || 'Potion'} onChange={e => onChange('cat', e.target.value)}>
            {['Potion','Scroll','Wondrous Item','Ring','Rod','Staff','Wand','Tool','Trinket','Ammunition','Consumable','Figurine'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Activation</label>
          <select value={fields.trig || 'Action'} onChange={e => onChange('trig', e.target.value)}>
            {['Action','Bonus Action','Passive','Reaction','Attunement','On Contact','Command Word'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Attunement</label>
          <select value={fields.att || 'No'} onChange={e => onChange('att', e.target.value)}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Usable By</label>
          <input type="text" placeholder="e.g. Any · Requires Attunement by Spellcaster" maxLength={55}
            value={fields.class || ''} onChange={e => onChange('class', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
