import type { Link } from '../types/link';

interface Props {
  links: Link[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LinkList({ links, loading, error, onRetry }: Props) {
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

  if (links.length === 0) {
    return (
      <div className="card state">
        No shortcuts yet. Create the first one to get started.
      </div>
    );
  }

  return (
    <ul className="list" aria-label="Shortcuts">
      {links.map((l) => (
        <li key={l.id} className="card list__item">
          <a className="list__alias" href={`/go/${l.shortname}`}>go/{l.shortname}</a>
          <a
            className="list__target"
            href={l.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {l.url}
          </a>
        </li>
      ))}
    </ul>
  );
}
