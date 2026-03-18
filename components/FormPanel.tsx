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
import ArtSection from './forms/ArtSection';
import TextSection from './forms/TextSection';
import StatsSection from './forms/StatsSection';

interface Props {
  state: CardState;
  dispatch: React.Dispatch<CardAction>;
  onExport: () => void;
  exporting: boolean;
  exportLabel: string;
}

const FIELD_COMPONENTS: Record<CardType, React.ComponentType<{ fields: Record<string, string>; onChange: (k: string, v: string) => void }>> = {
  spell: SpellFields,
  armor: ArmorFields,
  equipment: EquipmentFields,
  weapon: WeaponFields,
  sidekick: SidekickFields,
  anything: AnythingFields,
};

export default function FormPanel({ state, dispatch, onExport, exporting, exportLabel }: Props) {
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

      <ArtSection
        icons={cfg.icons}
        currentIcon={state.icon}
        currentImage={state.image}
        onIconChange={ic => dispatch({ type: 'SET_ICON', payload: ic })}
        onImageChange={img => dispatch({ type: 'SET_IMAGE', payload: img })}
      />

      <TextSection fields={state.fields} onChange={onFieldChange} />
      <StatsSection fields={state.fields} onChange={onFieldChange} />

      <button
        className={`btn-finish${exporting ? ' btn-loading' : ''}`}
        onClick={onExport}
        disabled={exporting}
      >
        {exportLabel}
      </button>
      <p className="export-note">Pokémon card size · 63mm × 88mm · print-ready PNG</p>
    </div>
  );
}
