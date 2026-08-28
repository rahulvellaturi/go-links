/**
 * A single Go Link: a short name that redirects to a destination URL,
 * with lightweight usage tracking.
 */
export interface Link {
  id: string;
  shortname: string;
  url: string;
  createdAt: string;
  visitCount: number;
  lastVisitedAt: string | null;
}

/** The shape the user submits when creating a link. */
export type NewLink = Pick<Link, 'shortname' | 'url'>;
