/** A single Go Link: a short name that redirects to a destination URL. */
export interface Link {
  id: string;
  shortname: string;
  url: string;
  createdAt: string;
}

/** The shape the user submits when creating a link. */
export type NewLink = Pick<Link, 'shortname' | 'url'>;
