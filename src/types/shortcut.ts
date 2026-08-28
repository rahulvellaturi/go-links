/**
 * A single Go Link: a short, memorable alias that redirects to a full URL.
 * e.g. { alias: "payroll", targetUrl: "https://intranet/hr/payroll" } => go/payroll
 */
export interface Shortcut {
  id: string;
  alias: string;
  targetUrl: string;
  createdAt: string; // ISO timestamp
}

/** The shape a user submits when creating a shortcut (server/client fills the rest). */
export type NewShortcut = Pick<Shortcut, 'alias' | 'targetUrl'>;
