'use client';

import { MtgCardState, MtgCardAction } from '@/lib/mtgTypes';
import {
  MtgIdentitySection,
  MtgLayoutSection,
  MtgFrameSection,
  MtgRulesTextSection,
  MtgArtSection,
} from './MtgCommonFields';
import MtgCreatureFields from './MtgCreatureFields';
import MtgLandFields from './MtgLandFields';
import MtgInstantSorceryFields from './MtgInstantSorceryFields';
import MtgEnchantmentFields from './MtgEnchantmentFields';
import MtgArtifactFields from './MtgArtifactFields';
import MtgPlaneswalkerFields from './MtgPlaneswalkerFields';
import MtgBattleFields from './MtgBattleFields';
import MtgSagaFields from './MtgSagaFields';

interface Props {
  state: MtgCardState;
  dispatch: React.Dispatch<MtgCardAction>;
  onExport: () => void;
  exporting: boolean;
  exportLabel: string;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
  autosaveHint?: string | null;
}

export default function MtgFormPanel({
  state,
  dispatch,
  onExport,
  exporting,
  exportLabel,
  onSave,
  saving,
  saveLabel,
  saveDisabled,
  autosaveHint,
}: Props) {
  function onChange(key: keyof MtgCardState, value: unknown) {
    dispatch({ type: 'SET_MTG_FIELD', payload: { key, value } });
  }

  const sharedProps = { state, onChange };

  return (
    <div className="form-panel">
      {/* Identity: name, mana cost, modifiers, subtype */}
      <MtgIdentitySection {...sharedProps} />

      {/* Type-specific fields */}
      {state.type === 'creature' && <MtgCreatureFields {...sharedProps} />}
      {state.type === 'land' && <MtgLandFields {...sharedProps} />}
      {(state.type === 'instant' || state.type === 'sorcery') && (
        <MtgInstantSorceryFields {...sharedProps} />
      )}
      {state.type === 'enchantment' && <MtgEnchantmentFields {...sharedProps} />}
      {state.type === 'artifact' && <MtgArtifactFields {...sharedProps} />}
      {state.type === 'planeswalker' && <MtgPlaneswalkerFields {...sharedProps} />}
      {state.type === 'battle' && <MtgBattleFields {...sharedProps} />}
      {state.type === 'saga' && <MtgSagaFields {...sharedProps} />}

      {/* Rules text — for non-planeswalker non-saga cards */}
      {state.type !== 'planeswalker' && state.type !== 'saga' && (
        <MtgRulesTextSection {...sharedProps} />
      )}

      {/* Picture shape + text size (same as RPG forge) */}
      <MtgLayoutSection {...sharedProps} />

      {/* Art */}
      <MtgArtSection {...sharedProps} />

      {/* Frame & rarity */}
      <MtgFrameSection {...sharedProps} />

      {/* Save / Export */}
      <div className="fsec">
        <h3>Save & Export</h3>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || saveDisabled}
            className="btn-finish mb-2"
            style={{ background: saving ? undefined : 'linear-gradient(135deg, #2255aa, #3377cc, #2255aa)' }}
          >
            {saving ? '⏳ Saving…' : (saveLabel ?? 'Save to Library')}
          </button>
        )}

        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className={`btn-finish ${exporting ? 'btn-loading' : ''}`}
        >
          {exportLabel}
        </button>

        {autosaveHint && (
          <p className="export-note">{autosaveHint}</p>
        )}
      </div>
    </div>
  );
}
