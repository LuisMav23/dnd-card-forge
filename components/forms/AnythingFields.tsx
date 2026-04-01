'use client';

import { Loader } from 'lucide-react';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function AnythingFields({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>
        <Loader className="inline-block h-4 w-4 align-[-2px]" /> Card Identity
      </h3>
      <div className="frow c2">
        <div className="fg">
          <label>Card Name</label>
          <input type="text" placeholder="Name your creation…" maxLength={28}
            value={fields.name || ''} onChange={e => onChange('name', e.target.value)} />
        </div>
        <div className="fg">
          <label>Cost / Value / Level</label>
          <input type="text" maxLength={6}
            value={fields.cost || '—'} onChange={e => onChange('cost', e.target.value)} />
        </div>
      </div>
      <div className="frow c2">
        <div className="fg">
          <label>Type Label (left of bar)</label>
          <input type="text" placeholder="e.g. Mythic Artifact · Active" maxLength={38}
            value={fields.tl || ''} onChange={e => onChange('tl', e.target.value)} />
        </div>
        <div className="fg">
          <label>Subtype Label (right)</label>
          <input type="text" placeholder="e.g. Creation" maxLength={24}
            value={fields.tr || ''} onChange={e => onChange('tr', e.target.value)} />
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Footer / Source Label</label>
          <input type="text" placeholder="e.g. Homebrew · Campaign Exclusive" maxLength={55}
            value={fields.class || ''} onChange={e => onChange('class', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
