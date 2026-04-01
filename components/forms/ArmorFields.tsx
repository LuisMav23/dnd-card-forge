'use client';

import IconDisplay from '@/components/IconDisplay';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function ArmorFields({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3><IconDisplay iconId="shield" className="inline-block h-4 w-4 align-[-2px]" /> Armor Identity</h3>
      <div className="frow c2">
        <div className="fg">
          <label>Armor Name</label>
          <input type="text" placeholder="e.g. Plate of the Fallen Star" maxLength={28}
            value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="fg">
          <label>Base AC</label>
          <select value={fields.cost || '16'} onChange={e => onChange('cost', e.target.value)}>
            {['11','12','13','14','15','16','17','18','19','20','21 (artifact)'].map(v => (
              <option key={v} value={v.split(' ')[0]}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="frow c3">
        <div className="fg">
          <label>Armor Type</label>
          <select value={fields.atype || 'Heavy Armor'} onChange={e => onChange('atype', e.target.value)}>
            {['Light Armor','Medium Armor','Heavy Armor','Shield','Half-Plate','Mithral','Adamantine','Dragonscale'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Material</label>
          <select value={fields.mat || 'Steel'} onChange={e => onChange('mat', e.target.value)}>
            {['Steel','Mithral','Adamantine','Dragon Scale','Shadow Silk','Celestial Bronze','Bone','Enchanted Wood','Obsidian'].map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Attunement</label>
          <select value={fields.att || 'Yes'} onChange={e => onChange('att', e.target.value)}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Yes (by class)">Yes (class)</option>
          </select>
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Usable By</label>
          <input type="text" placeholder="e.g. Fighter · Paladin · Barbarian" maxLength={55}
            value={fields.class || ''} onChange={e => onChange('class', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
