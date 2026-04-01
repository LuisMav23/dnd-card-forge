'use client';

import { ClipboardList } from 'lucide-react';
import { getTierDifficulty } from '@/lib/statblockConfig';
import IconDisplay from '@/components/IconDisplay';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function EnvironmentFields({ fields, onChange }: Props) {
  const handleTierChange = (tier: string) => {
    onChange('tier', tier);
    onChange('difficulty', getTierDifficulty(tier));
  };

  return (
    <>
      <div className="fsec">
        <h3><IconDisplay iconId="mountain" className="inline-block h-4 w-4 align-[-2px]" /> Environment Identity</h3>
        <div className="frow c2">
          <div className="fg">
            <label>Name</label>
            <input type="text" placeholder="e.g. Raging River" maxLength={32}
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
            <label>Environment Type</label>
            <select value={fields.etype || 'Exploration'} onChange={e => onChange('etype', e.target.value)}>
              {['Event', 'Traversal', 'Social', 'Exploration'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Difficulty</label>
            <input type="text" placeholder="11"
              value={fields.difficulty || ''} onChange={e => onChange('difficulty', e.target.value)} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Description</label>
            <textarea placeholder="An evocative one-line summary of the environment…"
              value={fields.description || ''} onChange={e => onChange('description', e.target.value)}
              rows={2} maxLength={200} />
          </div>
        </div>
      </div>

      <div className="fsec">
        <h3>
          <ClipboardList className="inline-block h-4 w-4 align-[-2px]" /> Scene Details
        </h3>
        <div className="frow c1">
          <div className="fg">
            <label>Impulses</label>
            <textarea placeholder="How does this environment push and pull the people within it?"
              value={fields.impulses || ''} onChange={e => onChange('impulses', e.target.value)}
              rows={3} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Potential Adversaries</label>
            <textarea placeholder="Suggested adversaries that might appear in this environment…"
              value={fields.potentialAdversaries || ''} onChange={e => onChange('potentialAdversaries', e.target.value)}
              rows={2} />
          </div>
        </div>
        <div className="frow c1">
          <div className="fg">
            <label>Feature Questions</label>
            <textarea placeholder="Prompts for plot hooks and narrative connections…"
              value={fields.featureQuestions || ''} onChange={e => onChange('featureQuestions', e.target.value)}
              rows={3} />
          </div>
        </div>
      </div>
    </>
  );
}
