import { useCallback, useEffect, useState } from 'react';
import type { NewShortcut, Shortcut } from '../types/shortcut';
import { fetchShortcuts } from '../services/shortcutsApi';
import { normaliseAlias } from '../lib/validation';

interface ShortcutsState {
  shortcuts: Shortcut[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addShortcut: (input: NewShortcut) => Shortcut;
}

/**
 * Owns the shortcut collection: loads it from the API on mount, exposes
 * loading/error state, and lets the UI append new links in memory.
 *
 * Newly created shortcuts live only in memory — persisting them is the first
 * thing a real backend would add (see README tradeoffs).
 */
export function useShortcuts(): ShortcutsState {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchShortcuts()
      .then(setShortcuts)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Something went wrong.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const addShortcut = useCallback((input: NewShortcut): Shortcut => {
    const created: Shortcut = {
      id: crypto.randomUUID(),
      alias: normaliseAlias(input.alias),
      targetUrl: input.targetUrl.trim(),
      createdAt: new Date().toISOString(),
    };
    setShortcuts((current) => [created, ...current]);
    return created;
  }, []);

  return { shortcuts, loading, error, reload: load, addShortcut };
}
