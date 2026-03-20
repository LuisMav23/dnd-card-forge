'use client';

import { StatBlockState, StatBlockAction, GameSystem, StatBlockType, Feature } from '@/lib/statblockTypes';
import { STATBLOCK_TYPES } from '@/lib/statblockConfig';
import AdversaryFields from './forms/AdversaryFields';
import NpcFields from './forms/NpcFields';
import EnvironmentFields from './forms/EnvironmentFields';
import DndMonsterFields from './forms/DndMonsterFields';
import DndNpcFields from './forms/DndNpcFields';
import DndEnvironmentFields from './forms/DndEnvironmentFields';
import FeaturesEditor from './forms/FeaturesEditor';
import ArtSection from '@/components/forms/ArtSection';

interface Props {
  state: StatBlockState;
  dispatch: React.Dispatch<StatBlockAction>;
  onExport: () => void;
  exporting: boolean;
  exportLabel: string;
}

type FieldComponentType = React.ComponentType<{ fields: Record<string, string>; onChange: (k: string, v: string) => void }>;

const FIELD_COMPONENTS: Record<GameSystem, Record<StatBlockType, FieldComponentType>> = {
  daggerheart: {
    adversary: AdversaryFields,
    npc: NpcFields,
    environment: EnvironmentFields,
  },
  dnd: {
    adversary: DndMonsterFields,
    npc: DndNpcFields,
    environment: DndEnvironmentFields,
  },
};

export default function StatBlockFormPanel({ state, dispatch, onExport, exporting, exportLabel }: Props) {
  const cfg = STATBLOCK_TYPES[state.type];
  const FieldsComponent = FIELD_COMPONENTS[state.system][state.type];

  const onFieldChange = (key: string, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { key, value } });
  };

  const handleAddFeature = (feature: Feature) => {
    dispatch({ type: 'ADD_FEATURE', payload: feature });
  };

  const handleUpdateFeature = (feature: Feature) => {
    dispatch({ type: 'UPDATE_FEATURE', payload: feature });
  };

  const handleRemoveFeature = (id: string) => {
    dispatch({ type: 'REMOVE_FEATURE', payload: id });
  };

  return (
    <div className="form-panel">
      <FieldsComponent fields={state.fields} onChange={onFieldChange} />

      <FeaturesEditor
        features={state.features}
        onAdd={handleAddFeature}
        onUpdate={handleUpdateFeature}
        onRemove={handleRemoveFeature}
        label={state.system === 'dnd' ? 'Traits & Actions' : 'Features'}
      />

      <div className="fsec">
        <h3>🎨 Theme</h3>
        <div className="fg">
          <label>Background</label>
          <div className="swatches">
            {cfg.themes.map(th => (
              <div
                key={th.key}
                className={`swatch${state.theme === th.key ? ' active' : ''}`}
                style={{ background: th.bg }}
                title={th.name}
                onClick={() => dispatch({ type: 'SET_THEME', payload: th.key })}
              />
            ))}
          </div>
        </div>
      </div>

      <ArtSection
        icons={cfg.icons}
        currentIcon={state.icon}
        currentImage={state.image}
        onIconChange={ic => dispatch({ type: 'SET_ICON', payload: ic })}
        onImageChange={img => dispatch({ type: 'SET_IMAGE', payload: img })}
      />

      <button
        className={`btn-finish${exporting ? ' btn-loading' : ''}`}
        onClick={onExport}
        disabled={exporting}
      >
        {exportLabel}
      </button>
      <p className="export-note">Stat block export · print-ready PNG</p>
    </div>
  );
}
