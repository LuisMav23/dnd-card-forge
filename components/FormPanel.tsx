'use client';

import { CardState, CardAction, Rarity, CardType } from '@/lib/types';
import { CARD_TYPES } from '@/lib/cardConfig';
import SpellFields from './forms/SpellFields';
import ArmorFields from './forms/ArmorFields';
import EquipmentFields from './forms/EquipmentFields';
import WeaponFields from './forms/WeaponFields';
import SidekickFields from './forms/SidekickFields';
import AnythingFields from './forms/AnythingFields';
import ThemeSection from './forms/ThemeSection';
import BackgroundTextureSection from './forms/BackgroundTextureSection';
import ArtSection from './forms/ArtSection';
import TextSection from './forms/TextSection';
import StatsSection from './forms/StatsSection';

interface Props {
  state: CardState;
  dispatch: React.Dispatch<CardAction>;
  onExport: () => void;
  exporting: boolean;
  exportLabel: string;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
}

const FIELD_COMPONENTS: Record<CardType, React.ComponentType<{ fields: Record<string, string>; onChange: (k: string, v: string) => void }>> = {
  spell: SpellFields,
  armor: ArmorFields,
  equipment: EquipmentFields,
  weapon: WeaponFields,
  sidekick: SidekickFields,
  anything: AnythingFields,
};

export default function FormPanel({
  state,
  dispatch,
  onExport,
  exporting,
  exportLabel,
  onSave,
  saving,
  saveLabel,
  saveDisabled,
}: Props) {
  const cfg = CARD_TYPES[state.type];
  const FieldsComponent = FIELD_COMPONENTS[state.type];

  const onFieldChange = (key: string, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { key, value } });
  };

  return (
    <div className="form-panel">
      <FieldsComponent fields={state.fields} onChange={onFieldChange} />

      <ThemeSection
        themes={cfg.themes}
        currentTheme={state.theme}
        currentRarity={state.rarity}
        onThemeChange={t => dispatch({ type: 'SET_THEME', payload: t })}
        onRarityChange={r => dispatch({ type: 'SET_RARITY', payload: r as Rarity })}
      />

      <BackgroundTextureSection
        currentTexture={state.backgroundTexture}
        onTextureChange={url => dispatch({ type: 'SET_BACKGROUND_TEXTURE', payload: url })}
      />

      <ArtSection
        icons={cfg.icons}
        currentIcon={state.icon}
        currentImage={state.image}
        onIconChange={ic => dispatch({ type: 'SET_ICON', payload: ic })}
        onImageChange={img => dispatch({ type: 'SET_IMAGE', payload: img })}
      />

      <TextSection fields={state.fields} onChange={onFieldChange} />
      <StatsSection fields={state.fields} onChange={onFieldChange} />

      <div className="flex gap-2 w-full mt-4">
        {onSave && (
          <button
            className={`btn-finish flex-1 !mt-0 px-2 py-3 !text-sm ${saving ? ' btn-loading' : ''}`}
            onClick={onSave}
            disabled={saving || saveDisabled}
          >
            {saveLabel || 'Save to Library'}
          </button>
        )}
        <button
          className={`btn-finish flex-1 !mt-0 px-2 py-3 !text-sm ${exporting ? ' btn-loading' : ''}`}
          onClick={onExport}
          disabled={exporting}
        >
          {exportLabel}
        </button>
      </div>
      <p className="export-note">Pokémon card size · 63mm × 88mm · print-ready PNG</p>
    </div>
  );
}
