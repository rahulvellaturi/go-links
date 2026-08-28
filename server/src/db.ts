import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * SQLite persistence using Node's built-in `node:sqlite` (needs Node 22.13+,
 * no native build). The DB file is created and seeded on first run.
 */

export interface Link {
  id: string;
  shortname: string;
  url: string;
  createdAt: string;
  visits: number;
}

const DB_PATH =
  process.env.DB_PATH ??
  fileURLToPath(new URL('../../go-links.db', import.meta.url));

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id         TEXT PRIMARY KEY,
    shortname  TEXT NOT NULL UNIQUE,
    url        TEXT NOT NULL,
    created_at TEXT NOT NULL,
    visits     INTEGER NOT NULL DEFAULT 0
  );
`);

const tableInfo = db.prepare('PRAGMA table_info(links)').all() as Array<{ name: string }>;
if (!tableInfo.some((column) => column.name === 'visits')) {
  db.exec('ALTER TABLE links ADD COLUMN visits INTEGER NOT NULL DEFAULT 0;');
}

interface Row {
  id: string;
  shortname: string;
  url: string;
  created_at: string;
  visits: number;
}

const toLink = (r: Row): Link => ({
  id: r.id,
  shortname: r.shortname,
  url: r.url,
  createdAt: r.created_at,
  visits: Number(r.visits ?? 0),
});

export const normalise = (shortname: string): string => shortname.trim().toLowerCase();

export function getAllLinks(): Link[] {
  const rows = db.prepare('SELECT * FROM links ORDER BY created_at DESC').all() as unknown as Row[];
  return rows.map(toLink);
}

export function getLink(shortname: string): Link | undefined {
  const row = db.prepare('SELECT * FROM links WHERE shortname = ?').get(normalise(shortname)) as unknown as Row | undefined;
  return row ? toLink(row) : undefined;
}

export function createLink(shortname: string, url: string): Link {
  const link: Link = {
    id: randomUUID(),
    shortname: normalise(shortname),
    url: url.trim(),
    createdAt: new Date().toISOString(),
    visits: 0,
  };
  db.prepare('INSERT INTO links (id, shortname, url, created_at, visits) VALUES (?, ?, ?, ?, ?)')
    .run(link.id, link.shortname, link.url, link.createdAt, link.visits);
  return link;
}

export function incrementVisits(shortname: string): Link | undefined {
  const normalised = normalise(shortname);
  const row = db.prepare('SELECT * FROM links WHERE shortname = ?').get(normalised) as unknown as Row | undefined;
  if (!row) return undefined;

  const updated = {
    ...toLink(row),
    visits: Number(row.visits ?? 0) + 1,
  };

  db.prepare('UPDATE links SET visits = ? WHERE shortname = ?').run(updated.visits, normalised);
  return updated;
}

// Seed a few example links on first run so the list isn't empty.
if ((db.prepare('SELECT COUNT(*) AS n FROM links').get() as unknown as { n: number }).n === 0) {
  createLink('design-system', 'https://example.com/design-system');
  createLink('oncall', 'https://example.com/oncall-schedule');
  createLink('payroll', 'https://example.com/hr/payroll');
}
