import { useCallback, useEffect, useState } from 'react';
import type { Link, NewLink } from '../types/link';
import { fetchLinks, createLink as createLinkApi } from '../services/linksApi';

interface LinksState {
  links: Link[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  createLink: (input: NewLink) => Promise<void>;
}

/**
 * Owns the link collection: loads it from the API on mount, exposes loading and
 * error state, and creates new links through the API (persisted server-side).
 */
export function useLinks(): LinksState {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLinks()
      .then(setLinks)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Something went wrong.'),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  /** Create a link, then refresh so the new row (and its counts) show up. */
  const createLink = useCallback(async (input: NewLink) => {
    const created = await createLinkApi(input);
    setLinks((current) => [created, ...current]);
  }, []);

  return { links, loading, error, reload: load, createLink };
}
