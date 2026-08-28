import { useEffect } from 'react';
import type { Shortcut } from '../types/shortcut';

interface Props {
  alias: string;
  shortcuts: Shortcut[];
  loading: boolean;
}

/**
 * Resolves `go/:alias` to its destination and redirects. Waits for the list
 * to finish loading before deciding a link is missing, so a slow load never
 * shows a false "not found".
 */
export function RedirectView({ alias, shortcuts, loading }: Props) {
  const match = shortcuts.find((s) => s.alias === alias);

  useEffect(() => {
    if (match) {
      console.info(`[redirect] go/${alias} -> ${match.targetUrl}`);
      window.location.replace(match.targetUrl);
    }
  }, [match, alias]);

  if (loading) {
    return <div className="card state" role="status">Resolving go/{alias}…</div>;
  }

  if (match) {
    return (
      <div className="card state" role="status">
        Redirecting to{' '}
        <a href={match.targetUrl}>{match.targetUrl}</a>…
      </div>
    );
  }

  return (
    <div className="card state state--error" role="alert">
      <p>No shortcut found for go/{alias}.</p>
      <a className="button button--ghost" href="#/">Back to all shortcuts</a>
    </div>
  );
}
