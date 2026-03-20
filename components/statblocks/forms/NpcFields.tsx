'use client';

import { getTierDifficulty } from '@/lib/statblockConfig';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function NpcFields({ fields, onChange }: Props) {
  const handleTierChange = (tier: string) => {
    onChange('tier', tier);
    onChange('difficulty', getTierDifficulty(tier));
  };

  return (
    <>
      <div className="fsec">
        <h3>🧑 NPC Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Talia Brightwood" maxLength={32}
              value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div className="fg">
            <label>Tier</label>
            <select value={fields.tier || '1'} onChange={e => handleTierChange(e.target.value)}>
              <option value="1">Tier 1 (Level 1)</option>
              <option value="2">Tier 2 (Levels 2–4)</option>
              <option value="3">Tier 3 (Levels 5–7)</option>
              <option value="4">Tier 4 (Levels 8–10)</option>
            </select>
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Role / Occupation</label>
            <select value={fields.role || 'Merchant'} onChange={e => onChange('role', e.target.value)}>
              {['Merchant', 'Guard', 'Noble', 'Scholar', 'Healer', 'Spy', 'Artisan', 'Innkeeper', 'Farmer', 'Priest', 'Smuggler', 'Guide', 'Elder', 'Bard', 'Other'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Difficulty (Social Rolls)</label>
            <input type="text" placeholder="11"
              value={fields.difficulty || ''} onChange={e => onChange('difficulty', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Description</label>
            <textarea placeholder="A one-line summary of appearance and demeanor…"
              value={fields.description || ''} onChange={e => onChange('description', e.target.value)}
              rows={2} maxLength={200} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>📋 Details</h3>
        <div className="frow c1">
          <div className="fg">
            <label>Motives</label>
            <textarea placeholder="What drives this NPC? What do they want?"
              value={fields.motives || ''} onChange={e => onChange('motives', e.target.value)}
              rows={3} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Connections</label>
            <textarea placeholder="Who do they know? What factions or groups are they tied to?"
              value={fields.connections || ''} onChange={e => onChange('connections', e.target.value)}
              rows={2} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Notable Traits</label>
            <textarea placeholder="Quirks, mannerisms, or distinguishing characteristics…"
              value={fields.traits || ''} onChange={e => onChange('traits', e.target.value)}
              rows={2} />
          </div>
        </div>
      </div>
    </>
  );
}
