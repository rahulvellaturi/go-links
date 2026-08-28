import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

/**
 * SQLite persistence for shortcuts. Uses better-sqlite3 (synchronous, no
 * connection pool needed) with prepared statements. The DB file lives at the
 * project root and is created on first run.
 */

export interface Link {
  id: string;
  shortname: string;
  url: string;
  createdAt: string;
  visitCount: number;
  lastVisitedAt: string | null;
}

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'go-links.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id             TEXT PRIMARY KEY,
    shortname      TEXT NOT NULL UNIQUE,
    url            TEXT NOT NULL,
    created_at     TEXT NOT NULL,
    visit_count    INTEGER NOT NULL DEFAULT 0,
    last_visited_at TEXT
  );
`);

/** DB rows use snake_case; map them to the camelCase shape the app uses. */
interface Row {
  id: string;
  shortname: string;
  url: string;
  created_at: string;
  visit_count: number;
  last_visited_at: string | null;
}

function toLink(row: Row): Link {
  return {
    id: row.id,
    shortname: row.shortname,
    url: row.url,
    createdAt: row.created_at,
    visitCount: row.visit_count,
    lastVisitedAt: row.last_visited_at,
  };
}

export function normalise(shortname: string): string {
  return shortname.trim().toLowerCase();
}

const statements = {
  all: db.prepare('SELECT * FROM links ORDER BY created_at DESC'),
  byName: db.prepare('SELECT * FROM links WHERE shortname = ?'),
  insert: db.prepare(
    `INSERT INTO links (id, shortname, url, created_at, visit_count, last_visited_at)
     VALUES (@id, @shortname, @url, @createdAt, 0, NULL)`,
  ),
  recordVisit: db.prepare(
    `UPDATE links
     SET visit_count = visit_count + 1, last_visited_at = ?
     WHERE shortname = ?`,
  ),
};

/** Insert a few example links the first time the app runs, so the list isn't empty. */
function seedIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) AS n FROM links').get() as { n: number }).n;
  if (count > 0) return;
  const seeds: Array<[string, string]> = [
    ['design-system', 'https://example.com/design-system'],
    ['oncall', 'https://example.com/oncall-schedule'],
    ['payroll', 'https://example.com/hr/payroll'],
  ];
  for (const [shortname, url] of seeds) createLink(shortname, url);
}

export function getAllLinks(): Link[] {
  return (statements.all.all() as Row[]).map(toLink);
}

export function getLink(shortname: string): Link | undefined {
  const row = statements.byName.get(normalise(shortname)) as Row | undefined;
  return row ? toLink(row) : undefined;
}

export function createLink(shortname: string, url: string): Link {
  const link: Link = {
    id: randomUUID(),
    shortname: normalise(shortname),
    url: url.trim(),
    createdAt: new Date().toISOString(),
    visitCount: 0,
    lastVisitedAt: null,
  };
  statements.insert.run(link);
  return link;
}

export function recordVisit(shortname: string): void {
  statements.recordVisit.run(new Date().toISOString(), normalise(shortname));
}

seedIfEmpty();
