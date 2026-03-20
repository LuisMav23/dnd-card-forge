'use client';

import { Feature, FeatureKind } from '@/lib/statblockTypes';

interface Props {
  features: Feature[];
  onAdd: (feature: Feature) => void;
  onUpdate: (feature: Feature) => void;
  onRemove: (id: string) => void;
  label?: string;
}

const KINDS: { value: FeatureKind; label: string }[] = [
  { value: 'action', label: 'Action' },
  { value: 'passive', label: 'Passive' },
  { value: 'reaction', label: 'Reaction' },
];

export default function FeaturesEditor({ features, onAdd, onUpdate, onRemove, label = 'Features' }: Props) {
  const handleAdd = () => {
    onAdd({
      id: crypto.randomUUID(),
      kind: 'action',
      name: '',
      description: '',
    });
  };

  return (
    <div className="fsec">
      <h3>✦ {label}</h3>
      {features.map((feat, idx) => (
        <div key={feat.id} className="sb-feature-row">
          <div className="sb-feature-header">
            <span className="sb-feature-num">#{idx + 1}</span>
            <select
              value={feat.kind}
              onChange={e => onUpdate({ ...feat, kind: e.target.value as FeatureKind })}
              className="sb-feature-kind-select"
            >
              {KINDS.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Feature name"
              maxLength={40}
              value={feat.name}
              onChange={e => onUpdate({ ...feat, name: e.target.value })}
              className="sb-feature-name-input"
            />
            <button
              className="btn-sm sb-feature-remove"
              onClick={() => onRemove(feat.id)}
              title="Remove feature"
            >
              ✕
            </button>
          </div>
          <textarea
            placeholder="Describe what this feature does…"
            value={feat.description}
            onChange={e => onUpdate({ ...feat, description: e.target.value })}
            rows={2}
          />
        </div>
      ))}
      <button className="btn-sm sb-feature-add" onClick={handleAdd}>
        + Add {label.replace(/s$/, '')}
      </button>
    </div>
  );
}
