import { useEffect, useState } from 'react';

/**
 * Minimal hash-based routing. A dependency-free router is enough for one
 * redirect route; React Router would be the swap-in if routes multiply.
 * Returns the alias when the hash looks like `#/go/:alias`, else null.
 */
export function useGoAlias(): string | null {
  const [alias, setAlias] = useState<string | null>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setAlias(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return alias;
}

function parse(hash: string): string | null {
  const match = hash.match(/^#\/go\/(.+)$/);
  return match ? decodeURIComponent(match[1]).toLowerCase() : null;
}
