'use client';

import { BarChart3 } from 'lucide-react';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function StatsSection({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>
        <BarChart3 className="inline-block h-4 w-4 align-[-2px]" /> Stat Pips — up to 4 (leave blank to hide)
      </h3>
      <div className="stats-grid">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="stat-pair">
            <div className="row2">
              <div className="fg">
                <label>Stat {i + 1} Label</label>
                <input
                  type="text"
                  maxLength={9}
                  value={fields[`sl${i}`] || ''}
                  onChange={e => onChange(`sl${i}`, e.target.value)}
                />
              </div>
              <div className="fg">
                <label>Value</label>
                <input
                  type="text"
                  maxLength={9}
                  value={fields[`sv${i}`] || ''}
                  onChange={e => onChange(`sv${i}`, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
