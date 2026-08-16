import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSavedAt: string | null;
  hasRestoredDraft: boolean;
}

export function useAutoSaveDraft<T>(
  storageKey: string,
  defaultValues: T,
  debounceMs: number = 600
) {
  // Try to restore from localStorage or fall back to defaultValues
  const [draft, setDraft] = useState<T>(() => {
    if (!storageKey) return defaultValues;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultValues, ...parsed.data };
      }
    } catch (e) {
      console.warn('Failed to parse auto-save draft for key:', storageKey, e);
    }
    return defaultValues;
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    if (!storageKey) return null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.savedAt || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
      const saved = localStorage.getItem(storageKey);
      return !!saved;
    } catch {
      return false;
    }
  });

  // Track initial mount and current key
  const keyRef = useRef(storageKey);
  const isFirstRender = useRef(true);

  // When storageKey changes (e.g. switching visits or pets), re-load draft for the new key
  useEffect(() => {
    if (keyRef.current !== storageKey) {
      keyRef.current = storageKey;
      isFirstRender.current = true;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setDraft({ ...defaultValues, ...parsed.data });
          setLastSavedAt(parsed.savedAt || null);
          setHasRestoredDraft(true);
        } else {
          setDraft(defaultValues);
          setLastSavedAt(null);
          setHasRestoredDraft(false);
        }
      } catch (e) {
        setDraft(defaultValues);
        setHasRestoredDraft(false);
      }
    }
  }, [storageKey]);

  // Debounced save effect when `draft` changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!storageKey) return;

    setIsSaving(true);
    const handler = setTimeout(() => {
      try {
        const timeStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const payload = {
          data: draft,
          savedAt: timeStr,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setLastSavedAt(timeStr);
        setHasRestoredDraft(true);
      } catch (e) {
        console.error('Error saving draft to localStorage:', e);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [draft, storageKey, debounceMs]);

  // Clear draft from localStorage (called upon final submission/save)
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
      setLastSavedAt(null);
      setHasRestoredDraft(false);
    } catch (e) {
      console.error('Error clearing draft from localStorage:', e);
    }
  }, [storageKey]);

  // Discard draft and reset to default
  const discardDraft = useCallback(() => {
    clearDraft();
    setDraft(defaultValues);
  }, [clearDraft, defaultValues]);

  return {
    draft,
    setDraft,
    isSaving,
    lastSavedAt,
    hasRestoredDraft,
    clearDraft,
    discardDraft
  };
}
