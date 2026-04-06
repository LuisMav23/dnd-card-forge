'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/autosaveConstants';

export type ForgeLoadState = 'idle' | 'loading' | 'error' | 'ready';

export type UseLibraryItemAutosaveOptions<T> = {
  state: T;
  libraryIdFromUrl: string | null;
  loadState: ForgeLoadState;
  fromLibrary: boolean;
  router: { replace: (href: string) => void };
  /** `JSON.stringify(initialForgeState)` — no autosave until the document differs (new items only). */
  newItemBaselineSerialized: string;
  /** e.g. `/card/new` or `/statblocks/new` — `?library=` is appended after first save. */
  forgeNewPath: string;
  getTitle: () => string;
  persistPost: (args: { title: string; payload: T }) => Promise<{ id: string }>;
  persistPatch: (args: { id: string; title: string; payload: T }) => Promise<void>;
};

export function useLibraryItemAutosave<T>({
  state,
  libraryIdFromUrl,
  loadState,
  fromLibrary,
  router,
  newItemBaselineSerialized,
  forgeNewPath,
  getTitle,
  persistPost,
  persistPatch,
}: UseLibraryItemAutosaveOptions<T>) {
  const [clientDraftId, setClientDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Save to Library');
  const [autosaveHint, setAutosaveHint] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const libraryIdFromUrlRef = useRef(libraryIdFromUrl);
  libraryIdFromUrlRef.current = libraryIdFromUrl;

  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  const clientDraftIdRef = useRef<string | null>(null);
  clientDraftIdRef.current = clientDraftId;

  const persistPostRef = useRef(persistPost);
  persistPostRef.current = persistPost;

  const persistPatchRef = useRef(persistPatch);
  persistPatchRef.current = persistPatch;

  const getTitleRef = useRef(getTitle);
  getTitleRef.current = getTitle;

  const lastSavedSerializedRef = useRef<string | null>(null);
  const persistLockRef = useRef(false);
  const queuedPersistRef = useRef(false);
  const queuedManualRef = useRef(false);
  const autosaveHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipLibraryFetchIdRef = useRef<string | null>(null);
  const lastSyncedLibraryRowRef = useRef<string | null>(null);

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
    setSaveLabel(libraryIdFromUrl ? 'Update in Library' : 'Save to Library');
  }, [libraryIdFromUrl]);

  useEffect(() => {
    if (libraryIdFromUrl && clientDraftId && libraryIdFromUrl === clientDraftId) {
      setClientDraftId(null);
    }
  }, [libraryIdFromUrl, clientDraftId]);

  useEffect(() => {
    lastSyncedLibraryRowRef.current = null;
  }, [libraryIdFromUrl]);

  useLayoutEffect(() => {
    if (loadState !== 'ready' || !libraryIdFromUrl) {
      return;
    }
    if (lastSyncedLibraryRowRef.current === libraryIdFromUrl) {
      return;
    }
    lastSyncedLibraryRowRef.current = libraryIdFromUrl;
    lastSavedSerializedRef.current = JSON.stringify(stateRef.current);
  }, [loadState, libraryIdFromUrl, state]);

  const computeDirty = useCallback(() => {
    const s = JSON.stringify(stateRef.current);
    if (lastSavedSerializedRef.current === null) {
      return s !== newItemBaselineSerialized;
    }
    return s !== lastSavedSerializedRef.current;
  }, [newItemBaselineSerialized]);

  const persist = useCallback(
    async (manual: boolean) => {
      if (loadStateRef.current !== 'ready') {
        return;
      }

      if (!manual && !computeDirty()) {
        return;
      }

      if (persistLockRef.current) {
        queuedPersistRef.current = true;
        if (manual) {
          queuedManualRef.current = true;
        }
        return;
      }

      const effId = libraryIdFromUrlRef.current ?? clientDraftIdRef.current;
      const wasPatch = Boolean(effId);

      persistLockRef.current = true;

      if (manual) {
        setSaving(true);
        setSaveLabel('⏳ Saving…');
      } else {
        setAutosaveHint('Saving…');
      }

      const finishManualUi = () => {
        if (!manual) {
          return;
        }
        window.setTimeout(() => {
          setSaving(false);
          setSaveLabel(
            (libraryIdFromUrlRef.current ?? clientDraftIdRef.current)
              ? 'Update in Library'
              : 'Save to Library'
          );
        }, 2500);
      };

      try {
        const payload = stateRef.current;
        const title = getTitleRef.current();

        if (wasPatch) {
          await persistPatchRef.current({ id: effId!, title, payload });
        } else {
          const { id: newId } = await persistPostRef.current({ title, payload });
          skipLibraryFetchIdRef.current = newId;
          setClientDraftId(newId);
          const libraryQs = fromLibrary
            ? `library=${encodeURIComponent(newId)}&from=library`
            : `library=${encodeURIComponent(newId)}`;
          const sep = forgeNewPath.includes('?') ? '&' : '?';
          router.replace(`${forgeNewPath}${sep}${libraryQs}`);
        }

        lastSavedSerializedRef.current = JSON.stringify(stateRef.current);

        if (manual) {
          setSaveLabel(wasPatch ? '✓ Updated!' : '✓ Saved!');
          finishManualUi();
        } else {
          setAutosaveHint('Saved');
          clearAutosaveHintSoon();
        }
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : '';
        if (manual) {
          if (msg === 'Unauthorized') {
            setSaveLabel('✕ Please login first');
          } else {
            setSaveLabel('✕ Error saving');
          }
          finishManualUi();
        } else {
          setAutosaveHint(
            msg === 'Unauthorized' ? 'Sign in to autosave' : 'Autosave failed — use Save'
          );
          clearAutosaveHintSoon();
        }
      } finally {
        persistLockRef.current = false;
        if (queuedPersistRef.current) {
          queuedPersistRef.current = false;
          const runManual = queuedManualRef.current;
          queuedManualRef.current = false;
          void persist(runManual);
        }
      }
    },
    [clearAutosaveHintSoon, computeDirty, forgeNewPath, fromLibrary, router]
  );

  useEffect(() => {
    if (loadState !== 'ready') {
      return;
    }
    if (!computeDirty()) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (loadStateRef.current !== 'ready') {
        return;
      }
      void persist(false);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [state, loadState, computeDirty, persist]);

  useEffect(() => {
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
      void persist(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [computeDirty, persist]);

  const persistManual = useCallback(() => {
    void persist(true);
  }, [persist]);

  return {
    skipLibraryFetchIdRef,
    persistManual,
    saving,
    saveLabel,
    autosaveHint,
  };
}
