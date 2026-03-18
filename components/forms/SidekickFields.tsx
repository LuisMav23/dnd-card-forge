'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function SidekickFields({ fields, onChange }: Props) {
  return (
    <>
      <div className="fsec">
        <h3>🧑 Sidekick Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Sidekick Name</label>
            <input type="text" placeholder="e.g. Aelindra, Scout of the Mist" maxLength={28}
              value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div className="fg">
            <label>Challenge Rating</label>
            <select value={fields.cost || '1'} onChange={e => onChange('cost', e.target.value)}>
              {['1/8','1/4','1/2','1','2','3','4','5','6','7','8','9','10'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="frow c3">
          <div className="fg">
            <label>Creature Type</label>
            <select value={fields.ctype || 'Humanoid'} onChange={e => onChange('ctype', e.target.value)}>
              {['Humanoid','Beast','Fey','Fiend','Celestial','Undead','Construct','Elemental','Dragon','Monstrosity','Aberration'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Role</label>
            <select value={fields.role || 'Expert'} onChange={e => onChange('role', e.target.value)}>
              {['Expert','Spellcaster','Warrior','Scout','Support','Tank','Ranger','Assassin'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Alignment</label>
            <select value={fields.align || 'Lawful Good'} onChange={e => onChange('align', e.target.value)}>
              {['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="fsec">
        <h3>📊 Ability Scores & Stats</h3>
        <div className="frow c3">
          {(['str','dex','con','int','wis','cha'] as const).map(ab => (
            <div key={ab} className="fg">
              <label>{ab.toUpperCase()}</label>
              <input type="text" maxLength={3}
                value={fields[ab] || '10'} onChange={e => onChange(ab, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
