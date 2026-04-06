import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EncounterInstanceState, PatchEntrySessionBody } from '@/lib/encounterTypes';
import {
  encounterInstancesToJson,
  normalizeEncounterInstances,
  parseEncounterEffects,
  parseEncounterInstanceStatesArray,
} from '@/lib/encounterStatHelpers';
import { internalError } from '@/lib/apiError';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; entryId: string }> }
) {
  const { id: encounterId, entryId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: enc } = await supabase
    .from('encounters')
    .select('id')
    .eq('id', encounterId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!enc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: PatchEntrySessionBody;
  try {
    body = (await request.json()) as PatchEntrySessionBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const hasRemaining = body.remaining !== undefined;
  const hasHp = body.hp_current !== undefined;
  const hasEffects = body.effects !== undefined;
  const hasInstanceStates = body.instance_states !== undefined;
  const hasInstanceIndex = body.instance_index !== undefined;

  if (!hasRemaining && !hasHp && !hasEffects && !hasInstanceStates) {
    return NextResponse.json(
      { error: 'Provide at least one of: remaining, hp_current, effects, instance_states' },
      { status: 400 }
    );
  }

  if (hasInstanceStates && (hasHp || hasEffects || hasInstanceIndex)) {
    return NextResponse.json(
      { error: 'Do not combine instance_states with hp_current, effects, or instance_index' },
      { status: 400 }
    );
  }

  const { data: row, error: fetchErr } = await supabase
    .from('encounter_entries')
    .select('id, count, encounter_id, remaining, hp_current, effects, instance_states')
    .eq('id', entryId)
    .eq('encounter_id', encounterId)
    .maybeSingle();

  if (fetchErr) {
    return internalError(fetchErr, 'encounters/entries/PATCH/fetch');
  }
  if (!row) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  const legacyHp = row.hp_current === null || row.hp_current === undefined ? null : row.hp_current;
  const legacyFx = parseEncounterEffects(row.effects) ?? [];

  let instances = normalizeEncounterInstances(
    row.count,
    row.instance_states,
    legacyHp,
    legacyFx
  );

  const update: Record<string, unknown> = {};

  if (hasRemaining) {
    if (typeof body.remaining !== 'number' || !Number.isInteger(body.remaining)) {
      return NextResponse.json({ error: 'remaining must be an integer' }, { status: 400 });
    }
    if (body.remaining < 0 || body.remaining > row.count) {
      return NextResponse.json(
        { error: `remaining must be between 0 and ${row.count}` },
        { status: 400 }
      );
    }
    update.remaining = body.remaining;
  }

  if (hasInstanceStates) {
    const parsed = parseEncounterInstanceStatesArray(body.instance_states, row.count);
    if (parsed === null) {
      return NextResponse.json(
        { error: `instance_states must be an array of length ${row.count}` },
        { status: 400 }
      );
    }
    instances = parsed;
  } else if (hasHp || hasEffects) {
    if (row.count > 1) {
      if (!hasInstanceIndex || typeof body.instance_index !== 'number' || !Number.isInteger(body.instance_index)) {
        return NextResponse.json(
          { error: 'instance_index (integer) is required when count > 1' },
          { status: 400 }
        );
      }
      if (body.instance_index < 0 || body.instance_index >= row.count) {
        return NextResponse.json(
          { error: `instance_index must be between 0 and ${row.count - 1}` },
          { status: 400 }
        );
      }
    }

    const idx = row.count > 1 ? (body.instance_index as number) : 0;
    const slot = instances[idx];

    if (hasHp) {
      if (body.hp_current === null) {
        slot.hp_current = null;
      } else if (typeof body.hp_current === 'number' && Number.isInteger(body.hp_current)) {
        if (body.hp_current < 0) {
          return NextResponse.json({ error: 'hp_current cannot be negative' }, { status: 400 });
        }
        slot.hp_current = body.hp_current;
      } else {
        return NextResponse.json({ error: 'hp_current must be an integer ≥ 0 or null' }, { status: 400 });
      }
    }

    if (hasEffects) {
      const parsedFx = parseEncounterEffects(body.effects);
      if (parsedFx === null) {
        return NextResponse.json({ error: 'effects must be a valid array' }, { status: 400 });
      }
      slot.effects = parsedFx;
    }

    instances[idx] = slot;
  }

  const first = instances[0];
  update.hp_current = first.hp_current;
  update.effects = first.effects;
  update.instance_states = encounterInstancesToJson(instances);

  const now = new Date().toISOString();
  const { error: upErr } = await supabase
    .from('encounter_entries')
    .update(update)
    .eq('id', entryId)
    .eq('encounter_id', encounterId);

  if (upErr) {
    return internalError(upErr, 'encounters/entries/PATCH/update');
  }

  const { error: encUpErr } = await supabase
    .from('encounters')
    .update({ updated_at: now })
    .eq('id', encounterId);

  if (encUpErr) {
    return internalError(encUpErr, 'encounters/entries/PATCH/enc-updated-at');
  }

  const { data: fresh, error: selErr } = await supabase
    .from('encounter_entries')
    .select('id, remaining, hp_current, effects, instance_states')
    .eq('id', entryId)
    .single();

  if (selErr || !fresh) {
    return NextResponse.json({ ok: true });
  }

  const merged: EncounterInstanceState[] = normalizeEncounterInstances(
    row.count,
    fresh.instance_states,
    fresh.hp_current === undefined || fresh.hp_current === null ? null : fresh.hp_current,
    parseEncounterEffects(fresh.effects) ?? []
  );

  return NextResponse.json({
    ok: true,
    id: fresh.id,
    remaining: fresh.remaining,
    hp_current: fresh.hp_current,
    effects: fresh.effects,
    instances: merged,
  });
}
