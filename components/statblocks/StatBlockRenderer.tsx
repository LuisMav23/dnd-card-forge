'use client';

import React, { forwardRef } from 'react';
import { StatBlockState } from '@/lib/statblockTypes';
import { crossOriginForImgSrc } from '@/lib/crossOriginForImgSrc';
import { statBlockPaletteCssVars } from '@/lib/statBlockPalette';

interface Props {
  state: StatBlockState;
}

function abilityMod(score: string): string {
  const n = parseInt(score, 10);
  if (isNaN(n)) return '+0';
  const mod = Math.floor((n - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const StatBlockRenderer = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  if (state.system === 'dnd') return <DndStatBlock ref={ref} state={state} />;
  return <DaggerheartStatBlock ref={ref} state={state} />;
});
StatBlockRenderer.displayName = 'StatBlockRenderer';
export default StatBlockRenderer;

/* ═══════════════════════════════════════════
   DAGGERHEART RENDERER (existing, updated)
   ═══════════════════════════════════════════ */

const DaggerheartStatBlock = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const f = state.fields;
  const name = f.name || 'Unnamed';
  const tier = f.tier || '1';
  const description = f.description || '';

  return (
    <div ref={ref} className="sb-card" style={statBlockPaletteCssVars(state)}>
      <div className="sb-bg" />

      <div className="sb-header">
        <div className="sb-header-left">
          {state.image ? (
            <img
              src={state.image}
              alt="Stat block art"
              className="sb-header-img"
              crossOrigin={crossOriginForImgSrc(state.image)}
            />
          ) : (
            <span className="sb-header-icon">{state.icon}</span>
          )}
          <div>
            <div className="sb-name">{name}</div>
            <div className="sb-subtype">
              {state.type === 'adversary' && `${f.atype || 'Standard'} Adversary`}
              {state.type === 'npc' && `${f.role || 'NPC'}`}
              {state.type === 'environment' && `${f.etype || 'Exploration'}`}
            </div>
          </div>
        </div>
        <div className="sb-tier-badge">
          <span className="sb-tier-num">{tier}</span>
          <span className="sb-tier-label">Tier</span>
        </div>
      </div>

      {description && (
        <div className="sb-section sb-desc-section">
          <p className="sb-desc">&ldquo;{description}&rdquo;</p>
        </div>
      )}

      {state.type === 'adversary' && <DhAdversaryBlock fields={f} />}
      {state.type === 'npc' && <DhNpcBlock fields={f} />}
      {state.type === 'environment' && <DhEnvironmentBlock fields={f} />}

      {state.features.length > 0 && (
        <div className="sb-section">
          <div className="sb-section-title">Features</div>
          {state.features.map(feat => (
            <div key={feat.id} className="sb-feature">
              <span className={`sb-feature-badge sb-badge-${feat.kind}`}>
                {feat.kind === 'action' ? 'A' : feat.kind === 'passive' ? 'P' : 'R'}
              </span>
              <span className="sb-feature-name">{feat.name || 'Unnamed'}</span>
              {feat.description && (
                <span className="sb-feature-desc"> — {feat.description}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sb-footer">
        <span className="sb-footer-system">Daggerheart</span>
        <span className="sb-footer-type">
          {state.type === 'adversary' ? '⚔️ Adversary' : state.type === 'npc' ? '🧑 NPC' : '🏔️ Environment'}
        </span>
      </div>
    </div>
  );
});
DaggerheartStatBlock.displayName = 'DaggerheartStatBlock';

function DhAdversaryBlock({ fields: f }: { fields: Record<string, string> }) {
  return (
    <>
      <div className="sb-section">
        <div className="sb-stats-grid">
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Difficulty</span>
            <span className="sb-stat-value">{f.difficulty || '11'}</span>
          </div>
          <div className="sb-stat-cell">
            <span className="sb-stat-label">HP</span>
            <span className="sb-stat-value">{f.hp || '6'}</span>
          </div>
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Stress</span>
            <span className="sb-stat-value">{f.stress || '2'}</span>
          </div>
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Atk Mod</span>
            <span className="sb-stat-value">{f.atkMod || '+2'}</span>
          </div>
        </div>
      </div>

      <div className="sb-section">
        <div className="sb-section-title">Damage Thresholds</div>
        <p className="sb-threshold-note">Hit = Minor Damage</p>
        <div className="sb-threshold-row">
          <div className="sb-threshold">
            <span className="sb-threshold-label">Major</span>
            <span className="sb-threshold-value">{f.thresholdMajor || '7'}</span>
          </div>
          <div className="sb-threshold">
            <span className="sb-threshold-label">Severe</span>
            <span className="sb-threshold-value">{f.thresholdSevere || '13'}</span>
          </div>
        </div>
      </div>

      <div className="sb-section">
        <div className="sb-section-title">Attack</div>
        <div className="sb-attack-row">
          <span className="sb-attack-name">{f.weaponName || 'Claws'}</span>
          <span className="sb-attack-meta">
            {f.atkRange || 'Melee'} | {f.atkDamage || '1d8+2'} {f.dmgType?.toLowerCase() || 'physical'} damage
          </span>
        </div>
      </div>

      {f.motives && (
        <div className="sb-section">
          <div className="sb-section-title">Motives & Tactics</div>
          <p className="sb-body-text">{f.motives}</p>
        </div>
      )}

      {f.experience && (
        <div className="sb-section">
          <div className="sb-section-title">Experience</div>
          <p className="sb-body-text">{f.experience}</p>
        </div>
      )}
    </>
  );
}

function DhNpcBlock({ fields: f }: { fields: Record<string, string> }) {
  return (
    <>
      <div className="sb-section">
        <div className="sb-stats-grid sb-stats-2col">
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Difficulty</span>
            <span className="sb-stat-value">{f.difficulty || '11'}</span>
          </div>
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Role</span>
            <span className="sb-stat-value">{f.role || 'Merchant'}</span>
          </div>
        </div>
      </div>
      {f.motives && (
        <div className="sb-section">
          <div className="sb-section-title">Motives</div>
          <p className="sb-body-text">{f.motives}</p>
        </div>
      )}
      {f.connections && (
        <div className="sb-section">
          <div className="sb-section-title">Connections</div>
          <p className="sb-body-text">{f.connections}</p>
        </div>
      )}
      {f.traits && (
        <div className="sb-section">
          <div className="sb-section-title">Notable Traits</div>
          <p className="sb-body-text">{f.traits}</p>
        </div>
      )}
    </>
  );
}

function DhEnvironmentBlock({ fields: f }: { fields: Record<string, string> }) {
  return (
    <>
      <div className="sb-section">
        <div className="sb-stats-grid sb-stats-2col">
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Difficulty</span>
            <span className="sb-stat-value">{f.difficulty || '11'}</span>
          </div>
          <div className="sb-stat-cell">
            <span className="sb-stat-label">Type</span>
            <span className="sb-stat-value">{f.etype || 'Exploration'}</span>
          </div>
        </div>
      </div>
      {f.impulses && (
        <div className="sb-section">
          <div className="sb-section-title">Impulses</div>
          <p className="sb-body-text">{f.impulses}</p>
        </div>
      )}
      {f.potentialAdversaries && (
        <div className="sb-section">
          <div className="sb-section-title">Potential Adversaries</div>
          <p className="sb-body-text">{f.potentialAdversaries}</p>
        </div>
      )}
      {f.featureQuestions && (
        <div className="sb-section">
          <div className="sb-section-title">Feature Questions</div>
          <p className="sb-body-text">{f.featureQuestions}</p>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════
   D&D 5e RENDERER
   ═══════════════════════════════════════ */

const DndStatBlock = forwardRef<HTMLDivElement, Props>(({ state }, ref) => {
  const f = state.fields;
  const name = f.name || 'Unnamed';

  return (
    <div ref={ref} className="sb-card sb-dnd" style={statBlockPaletteCssVars(state)}>
      <div className="sb-bg" />

      <div className="sb-header">
        <div className="sb-header-left">
          {state.image ? (
            <img
              src={state.image}
              alt="Stat block art"
              className="sb-header-img"
              crossOrigin={crossOriginForImgSrc(state.image)}
            />
          ) : (
            <span className="sb-header-icon">{state.icon}</span>
          )}
          <div>
            <div className="sb-name">{name}</div>
            <div className="sb-subtype">
              {state.type === 'adversary' && `${f.size || 'Medium'} ${f.creatureType?.toLowerCase() || 'beast'}, ${f.alignment?.toLowerCase() || 'unaligned'}`}
              {state.type === 'npc' && `${f.race || 'Human'} ${f.classOccupation || 'Commoner'}, ${f.alignment?.toLowerCase() || 'neutral'}`}
              {state.type === 'environment' && `${f.hazardType || 'Trap'}`}
            </div>
          </div>
        </div>
      </div>

      {f.description && (
        <div className="sb-section sb-desc-section">
          <p className="sb-desc">&ldquo;{f.description}&rdquo;</p>
        </div>
      )}

      {state.type === 'adversary' && <DndMonsterBlock fields={f} />}
      {state.type === 'npc' && <DndNpcBlock fields={f} />}
      {state.type === 'environment' && <DndEnvironmentBlock fields={f} />}

      {state.features.length > 0 && (
        <div className="sb-section">
          <div className="sb-section-title">
            {state.features.some(ft => ft.kind === 'action') ? 'Traits & Actions' : 'Traits'}
          </div>
          {state.features.map(feat => (
            <div key={feat.id} className="sb-feature">
              <span className={`sb-feature-badge sb-badge-${feat.kind}`}>
                {feat.kind === 'action' ? 'A' : feat.kind === 'passive' ? 'P' : 'R'}
              </span>
              <span className="sb-feature-name">{feat.name || 'Unnamed'}</span>
              {feat.description && (
                <span className="sb-feature-desc"> — {feat.description}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="sb-footer">
        <span className="sb-footer-system">D&D 5e</span>
        <span className="sb-footer-type">
          {state.type === 'adversary' ? '🐉 Monster' : state.type === 'npc' ? '🧑 NPC' : '⚠️ Hazard'}
        </span>
      </div>
    </div>
  );
});
DndStatBlock.displayName = 'DndStatBlock';

function DndMonsterBlock({ fields: f }: { fields: Record<string, string> }) {
  const acDisplay = f.acSource ? `${f.ac || '10'} (${f.acSource})` : (f.ac || '10');
  const hpDisplay = f.hpDice ? `${f.hp || '1'} (${f.hpDice})` : (f.hp || '1');
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <>
      <div className="sb-section sb-dnd-core-stats">
        <div className="sb-dnd-stat-line"><strong>Armor Class</strong> {acDisplay}</div>
        <div className="sb-dnd-stat-line"><strong>Hit Points</strong> {hpDisplay}</div>
        <div className="sb-dnd-stat-line"><strong>Speed</strong> {f.speed || '30 ft.'}</div>
      </div>

      <div className="sb-section">
        <div className="sb-dnd-ability-row">
          {abilities.map(a => (
            <div key={a} className="sb-dnd-ability">
              <span className="sb-dnd-ability-label">{a.toUpperCase()}</span>
              <span className="sb-dnd-ability-score">{f[a] || '10'} ({abilityMod(f[a] || '10')})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-section sb-dnd-props">
        {f.savingThrows && <div className="sb-dnd-stat-line"><strong>Saving Throws</strong> {f.savingThrows}</div>}
        {f.skills && <div className="sb-dnd-stat-line"><strong>Skills</strong> {f.skills}</div>}
        {f.damageResistances && <div className="sb-dnd-stat-line"><strong>Damage Resistances</strong> {f.damageResistances}</div>}
        {f.damageImmunities && <div className="sb-dnd-stat-line"><strong>Damage Immunities</strong> {f.damageImmunities}</div>}
        {f.conditionImmunities && <div className="sb-dnd-stat-line"><strong>Condition Immunities</strong> {f.conditionImmunities}</div>}
        <div className="sb-dnd-stat-line"><strong>Senses</strong> {f.senses || 'passive Perception 10'}</div>
        <div className="sb-dnd-stat-line"><strong>Languages</strong> {f.languages || '—'}</div>
        <div className="sb-dnd-stat-line"><strong>Challenge</strong> {f.cr || '0'} ({f.xp || '0'} XP)</div>
      </div>
    </>
  );
}

function DndNpcBlock({ fields: f }: { fields: Record<string, string> }) {
  const acDisplay = f.acSource ? `${f.ac || '10'} (${f.acSource})` : (f.ac || '10');
  const hpDisplay = f.hpDice ? `${f.hp || '1'} (${f.hpDice})` : (f.hp || '1');
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <>
      <div className="sb-section sb-dnd-core-stats">
        <div className="sb-dnd-stat-line"><strong>Armor Class</strong> {acDisplay}</div>
        <div className="sb-dnd-stat-line"><strong>Hit Points</strong> {hpDisplay}</div>
        <div className="sb-dnd-stat-line"><strong>Speed</strong> {f.speed || '30 ft.'}</div>
      </div>

      <div className="sb-section">
        <div className="sb-dnd-ability-row">
          {abilities.map(a => (
            <div key={a} className="sb-dnd-ability">
              <span className="sb-dnd-ability-label">{a.toUpperCase()}</span>
              <span className="sb-dnd-ability-score">{f[a] || '10'} ({abilityMod(f[a] || '10')})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-section sb-dnd-props">
        {f.skills && <div className="sb-dnd-stat-line"><strong>Skills</strong> {f.skills}</div>}
        <div className="sb-dnd-stat-line"><strong>Senses</strong> {f.senses || 'passive Perception 10'}</div>
        <div className="sb-dnd-stat-line"><strong>Languages</strong> {f.languages || 'Common'}</div>
        <div className="sb-dnd-stat-line"><strong>Challenge</strong> {f.cr || '0'} ({f.xp || '0'} XP)</div>
      </div>
    </>
  );
}

function DndEnvironmentBlock({ fields: f }: { fields: Record<string, string> }) {
  return (
    <>
      <div className="sb-section sb-dnd-core-stats">
        <div className="sb-dnd-stat-line"><strong>Type</strong> {f.hazardType || 'Trap'}</div>
        {f.saveDC && <div className="sb-dnd-stat-line"><strong>Save</strong> DC {f.saveDC} {f.saveAbility || 'Dexterity'}</div>}
        {f.damage && <div className="sb-dnd-stat-line"><strong>Damage</strong> {f.damage} {f.damageType?.toLowerCase() || 'piercing'}</div>}
      </div>

      {f.trigger && (
        <div className="sb-section">
          <div className="sb-section-title">Trigger</div>
          <p className="sb-body-text">{f.trigger}</p>
        </div>
      )}

      {f.effect && (
        <div className="sb-section">
          <div className="sb-section-title">Effect</div>
          <p className="sb-body-text">{f.effect}</p>
        </div>
      )}

      {f.countermeasures && (
        <div className="sb-section">
          <div className="sb-section-title">Countermeasures</div>
          <p className="sb-body-text">{f.countermeasures}</p>
        </div>
      )}
    </>
  );
}
