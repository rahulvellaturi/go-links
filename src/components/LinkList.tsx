import { useMemo, useState } from 'react';
import type { Link } from '../types/link';

interface Props {
  links: Link[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LinkList({ links, loading, error, onRetry }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) => l.shortname.includes(q) || l.url.toLowerCase().includes(q),
    );
  }, [links, query]);

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
    <section className="links">
      <input
        className="search"
        type="search"
        value={query}
        placeholder="Search shortcuts"
        aria-label="Search shortcuts"
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="card state">No shortcuts match “{query}”.</div>
      ) : (
        <ul className="list" aria-label="Shortcuts">
          {filtered.map((l) => (
            <li key={l.id} className="card list__item">
              <a className="list__alias" href={`/go/${l.shortname}`}>
                go/{l.shortname}
              </a>
              <a
                className="list__target"
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {l.url}
              </a>
              <span className="list__visits" title="Total visits">
                {l.visitCount} {l.visitCount === 1 ? 'visit' : 'visits'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
