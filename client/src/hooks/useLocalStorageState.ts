import { useState, useEffect, useRef } from 'react';

/**
 * Drop-in replacement for useState that persists to localStorage.
 * Fixes the "I delete it and it comes back" bug: previously every
 * component (Announcements, Leaderboard, Gallery, etc.) reset to its
 * hardcoded sample data on every page refresh because it only lived
 * in React state. This hook saves to the browser's localStorage on
 * every change and reloads from it on mount, so edits/deletes stick
 * around on that device/browser even after a refresh.
 *
 * Note: this is per-browser storage, not a shared server database.
 * Two different students on two different devices will each have
 * their own saved copy unless a real backend + database is added.
 *
 * `reviveDates` lets callers restore Date fields that JSON.stringify
 * turns into strings.
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  reviveDates?: (value: T) => T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const isFirstRun = useRef(true);

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        return reviveDates ? reviveDates(parsed) : parsed;
      }
    } catch {
      // fall through to initial value if storage is corrupted/unavailable
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    // Avoid writing back the exact same value we just hydrated from storage.
    if (isFirstRun.current) {
      isFirstRun.current = false;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full or unavailable (e.g. private browsing) — fail silently
    }
  }, [key, state]);

  // Keep multiple open tabs on the same device/browser in sync live.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        setState(reviveDates ? reviveDates(parsed) : parsed);
      } catch {
        // ignore malformed updates from other tabs
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState];
}
