import type { Link, NewLink } from '../types/link';

/**
 * Data-access layer. Talks to the Express API over HTTP. All network access for
 * links lives here, so the rest of the app never touches fetch directly.
 */

interface ApiError {
  error: string;
}

export async function fetchLinks(): Promise<Link[]> {
  const res = await fetch('/api/links');
  if (!res.ok) {
    throw new Error(`Could not load links (status ${res.status}).`);
  }
  return (await res.json()) as Link[];
}

/**
 * Create a link. On a validation or conflict error the server returns a JSON
 * message and a 4xx status, which we surface to the caller as an Error.
 */
export async function createLink(input: NewLink): Promise<Link> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(body?.error ?? `Could not create link (status ${res.status}).`);
  }
  return (await res.json()) as Link;
}
