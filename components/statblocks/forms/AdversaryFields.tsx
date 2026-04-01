'use client';

import { ClipboardList, Crosshair } from 'lucide-react';
import { getTierDifficulty } from '@/lib/statblockConfig';
import IconDisplay from '@/components/IconDisplay';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function AdversaryFields({ fields, onChange }: Props) {
  const handleTierChange = (tier: string) => {
    onChange('tier', tier);
    onChange('difficulty', getTierDifficulty(tier));
  };

  return (
    <>
      <div className="fsec">
        <h3><IconDisplay iconId="swords" className="inline-block h-4 w-4 align-[-2px]" /> Adversary Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Shadow Wraith" maxLength={32}
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
            <label>Adversary Type</label>
            <select value={fields.atype || 'Standard'} onChange={e => onChange('atype', e.target.value)}>
              {['Standard', 'Minion', 'Leader', 'Solo', 'Horde', 'Skulk', 'Bruiser', 'Support'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Damage Type</label>
            <select value={fields.dmgType || 'Physical'} onChange={e => onChange('dmgType', e.target.value)}>
              <option>Physical</option>
              <option>Magical</option>
            </select>
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
        <h3>
          <Crosshair className="inline-block h-4 w-4 align-[-2px]" /> Combat Stats
        </h3>
        <div className="frow c3">
          <div className="fg">
            <label>Difficulty</label>
            <input type="text" placeholder="11"
              value={fields.difficulty || ''} onChange={e => onChange('difficulty', e.target.value)} />
          </div>
          <div className="fg">
            <label>Hit Points</label>
            <input type="text" placeholder="6"
              value={fields.hp || ''} onChange={e => onChange('hp', e.target.value)} />
          </div>
          <div className="fg">
            <label>Stress</label>
            <input type="text" placeholder="2"
              value={fields.stress || ''} onChange={e => onChange('stress', e.target.value)} />
          </div>
        </div>
        <div className="frow c2">
          <div className="fg">
            <label>Threshold: Major</label>
            <input type="text" placeholder="7"
              value={fields.thresholdMajor || ''} onChange={e => onChange('thresholdMajor', e.target.value)} />
          </div>
          <div className="fg">
            <label>Threshold: Severe</label>
            <input type="text" placeholder="13"
              value={fields.thresholdSevere || ''} onChange={e => onChange('thresholdSevere', e.target.value)} />
          </div>
        </div>
        <p className="text-[.65rem] text-gold-dark/70 italic mt-[-4px]">A successful hit automatically deals minor damage.</p>
        <div className="frow c1">
          <div className="fg">
            <label>Attack Modifier</label>
            <input type="text" placeholder="+2"
              value={fields.atkMod || ''} onChange={e => onChange('atkMod', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3><IconDisplay iconId="sword" className="inline-block h-4 w-4 align-[-2px]" /> Attack</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Weapon Name</label>
            <input type="text" placeholder="e.g. Claws" maxLength={28}
              value={fields.weaponName || ''} onChange={e => onChange('weaponName', e.target.value)} />
          </div>
          <div className="fg">
            <label>Range</label>
            <select value={fields.atkRange || 'Melee'} onChange={e => onChange('atkRange', e.target.value)}>
              {['Melee', 'Close', 'Far', 'Very Far'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Damage</label>
            <input type="text" placeholder="1d8+2 physical damage"
              value={fields.atkDamage || ''} onChange={e => onChange('atkDamage', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>
          <ClipboardList className="inline-block h-4 w-4 align-[-2px]" /> Details
        </h3>
        <div className="frow c1">
          <div className="fg">
            <label>Motives & Tactics</label>
            <textarea placeholder="How does this adversary behave in confrontation?"
              value={fields.motives || ''} onChange={e => onChange('motives', e.target.value)}
              rows={3} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Experience</label>
            <textarea placeholder="Situational bonuses (e.g. +2 when hunting in darkness)"
              value={fields.experience || ''} onChange={e => onChange('experience', e.target.value)}
              rows={2} />
          </div>
        </div>
      </div>
    </>
  );
}
