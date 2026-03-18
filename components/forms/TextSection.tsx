'use client';

interface Props {
  fields: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function TextSection({ fields, onChange }: Props) {
  return (
    <div className="fsec">
      <h3>📜 Card Text</h3>
      <div className="frow c1">
        <div className="fg">
          <label>Flavor Text (italic quote)</label>
          <input
            type="text"
            placeholder="&quot;A line that sets the mood…&quot;"
            maxLength={120}
            value={fields.flavor || ''}
            onChange={e => onChange('flavor', e.target.value)}
          />
        </div>
      </div>
      <div className="frow c1">
        <div className="fg">
          <label>Description / Effect</label>
          <textarea
            rows={5}
            placeholder="Describe the effect, rules, stats, lore…"
            value={fields.desc || ''}
            onChange={e => onChange('desc', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
