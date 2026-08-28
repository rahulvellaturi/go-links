import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

/**
 * SQLite persistence using Node's built-in `node:sqlite` (needs Node 22.13+,
 * no native build). The DB file is created and seeded on first run.
 */

export interface Link {
  id: string;
  shortname: string;
  url: string;
  createdAt: string;
}

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'go-links.db');

const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id         TEXT PRIMARY KEY,
    shortname  TEXT NOT NULL UNIQUE,
    url        TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

interface Row {
  id: string;
  shortname: string;
  url: string;
  created_at: string;
}

const toLink = (r: Row): Link => ({
  id: r.id,
  shortname: r.shortname,
  url: r.url,
  createdAt: r.created_at,
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
  };
  db.prepare('INSERT INTO links (id, shortname, url, created_at) VALUES (?, ?, ?, ?)')
    .run(link.id, link.shortname, link.url, link.createdAt);
  return link;
}

// Seed a few example links on first run so the list isn't empty.
if ((db.prepare('SELECT COUNT(*) AS n FROM links').get() as unknown as { n: number }).n === 0) {
  createLink('design-system', 'https://example.com/design-system');
  createLink('oncall', 'https://example.com/oncall-schedule');
  createLink('payroll', 'https://example.com/hr/payroll');
}
