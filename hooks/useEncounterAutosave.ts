'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/autosaveConstants';
import {
  ENCOUNTER_NEW_BASELINE_SERIALIZED,
  serializeEncounterBuilderPayload,
  tryBuildEncounterPersistBody,
} from '@/lib/encounterAutosaveSerialize';
import type { CreateEncounterBody, EncounterBuilderPayload } from '@/lib/encounterTypes';

export type EncounterAutosaveLoadState = 'idle' | 'loading' | 'error' | 'ready';

type UseEncounterAutosaveOptions = {
  enabled: boolean;
  payload: EncounterBuilderPayload;
  encounterIdFromUrl: string | null;
  loadState: EncounterAutosaveLoadState;
  fromLibrary: boolean;
  router: { replace: (href: string) => void };
  persistPost: (body: CreateEncounterBody) => Promise<{ id: string }>;
  persistPatch: (id: string, body: CreateEncounterBody) => Promise<void>;
};

export function useEncounterAutosave({
  enabled,
  payload,
  encounterIdFromUrl,
  loadState,
  fromLibrary,
  router,
  persistPost,
  persistPatch,
}: UseEncounterAutosaveOptions) {
  const [autosaveHint, setAutosaveHint] = useState<string | null>(null);
  const [autosaveBusy, setAutosaveBusy] = useState(false);

  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  const encounterIdRef = useRef(encounterIdFromUrl);
  encounterIdRef.current = encounterIdFromUrl;

  const persistPostRef = useRef(persistPost);
  persistPostRef.current = persistPost;

  const persistPatchRef = useRef(persistPatch);
  persistPatchRef.current = persistPatch;

  const lastSavedSerializedRef = useRef<string | null>(null);
  const persistLockRef = useRef(false);
  const queuedPersistRef = useRef(false);
  const autosaveHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedEncounterIdRef = useRef<string | null>(null);

  const clearAutosaveHintSoon = useCallback(() => {
    if (autosaveHintTimerRef.current) {
      clearTimeout(autosaveHintTimerRef.current);
    }
    autosaveHintTimerRef.current = setTimeout(() => {
      setAutosaveHint(null);
      autosaveHintTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (autosaveHintTimerRef.current) {
        clearTimeout(autosaveHintTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    lastSyncedEncounterIdRef.current = null;
  }, [encounterIdFromUrl]);

  useLayoutEffect(() => {
    if (!enabled || loadState !== 'ready' || !encounterIdFromUrl) {
      return;
    }
    if (lastSyncedEncounterIdRef.current === encounterIdFromUrl) {
      return;
    }
    lastSyncedEncounterIdRef.current = encounterIdFromUrl;
    lastSavedSerializedRef.current = serializeEncounterBuilderPayload(payloadRef.current);
  }, [enabled, loadState, encounterIdFromUrl]);

  const computeDirty = useCallback(() => {
    const s = serializeEncounterBuilderPayload(payloadRef.current);
    if (lastSavedSerializedRef.current === null) {
      return s !== ENCOUNTER_NEW_BASELINE_SERIALIZED;
    }
    return s !== lastSavedSerializedRef.current;
  }, []);

  const persist = useCallback(async () => {
    if (!enabled || loadStateRef.current !== 'ready') {
      return;
    }

    if (!computeDirty()) {
      return;
    }

    const body = tryBuildEncounterPersistBody(payloadRef.current);
    if (!body) {
      return;
    }

    if (persistLockRef.current) {
      queuedPersistRef.current = true;
      return;
    }

    const effId = encounterIdRef.current;
    const wasPatch = Boolean(effId);

    persistLockRef.current = true;
    setAutosaveBusy(true);
    setAutosaveHint('Saving…');

    try {
      if (wasPatch) {
        await persistPatchRef.current(effId!, body);
      } else {
        const { id: newId } = await persistPostRef.current(body);
        const qs = fromLibrary ? '?from=library' : '';
        router.replace(`/encounters/${newId}/edit${qs}`);
      }

      lastSavedSerializedRef.current = serializeEncounterBuilderPayload(payloadRef.current);
      setAutosaveHint('Saved');
      clearAutosaveHintSoon();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '';
      setAutosaveHint(
        msg === 'Unauthorized' ? 'Sign in to autosave' : 'Autosave failed — use Save'
      );
      clearAutosaveHintSoon();
    } finally {
      persistLockRef.current = false;
      setAutosaveBusy(false);
      if (queuedPersistRef.current) {
        queuedPersistRef.current = false;
        void persist();
      }
    }
  }, [clearAutosaveHintSoon, computeDirty, enabled, fromLibrary, router]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (loadState !== 'ready') {
      return;
    }
    if (!computeDirty()) {
      return;
    }
    if (!tryBuildEncounterPersistBody(payload)) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (loadStateRef.current !== 'ready') {
        return;
      }
      void persist();
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, payload, loadState, computeDirty, persist]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onVis = () => {
      if (document.visibilityState !== 'hidden') {
        return;
      }
      if (loadStateRef.current !== 'ready') {
        return;
      }
      if (!computeDirty()) {
        return;
      }
      if (!tryBuildEncounterPersistBody(payloadRef.current)) {
        return;
      }
      void persist();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [enabled, computeDirty, persist]);

  return { autosaveHint, autosaveBusy };
}
