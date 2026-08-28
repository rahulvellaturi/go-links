import type { Link } from '../types/link';
import { useEffect, useRef, useState } from 'react';

interface Props {
  links: Link[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  showToast?: (msg: string) => void;
}

function VisitCount({ count }: { count: number }) {
  const [animate, setAnimate] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count !== prev.current) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 400);
      prev.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <span className={`list__visits ${animate ? 'list__visits--pulse' : ''}`}>
      {count} visit{count === 1 ? '' : 's'}
    </span>
  );
}

export function LinkList({ links, loading, error, onRetry, showToast }: Props) {
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
      {links.map((l) => {
        const visitCount = Number(l.visits ?? 0);

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(`https://go/${l.shortname}`);
            showToast?.(`Copied go/${l.shortname}`);
          } catch {
            showToast?.('Could not copy');
          }
        };

        return (
          <li key={l.id} className="card list__item">
            <div className="list__meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a className="list__alias" href={`/go/${l.shortname}`}>
                  go/{l.shortname}
                </a>
                <button type="button" className="copy-button" onClick={handleCopy} aria-label={`Copy go/${l.shortname}`}>
                  Copy
                </button>
              </div>
              <VisitCount count={visitCount} />
            </div>

            <a
              className="list__target"
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {l.url}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
