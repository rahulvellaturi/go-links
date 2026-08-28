import type { Shortcut } from '../types/shortcut';

interface Props {
  shortcuts: Shortcut[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ShortcutList({ shortcuts, loading, error, onRetry }: Props) {
  if (loading) {
    return <div className="card state" role="status">Loading shortcuts…</div>;
  }

  if (error) {
    return (
      <div className="card state state--error" role="alert">
        <p>{error}</p>
        <button type="button" className="button button--ghost" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (shortcuts.length === 0) {
    return (
      <div className="card state">
        No shortcuts yet. Create the first one to get started.
      </div>
    );
  }

  return (
    <ul className="list" aria-label="Existing shortcuts">
      {shortcuts.map((s) => (
        <li key={s.id} className="card list__item">
          <a className="list__alias" href={`#/go/${s.alias}`}>
            go/{s.alias}
          </a>
          <a
            className="list__target"
            href={s.targetUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            {s.targetUrl}
          </a>
        </li>
      ))}
    </ul>
  );
}
