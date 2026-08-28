import express from 'express';
import { getAllLinks, getLink, createLink } from './db';

const app = express();
app.use(express.json());

// Simple request log: method, path, status.
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

const SHORTNAME = /^[a-z0-9-]+$/;

/** GET /api/links — list all shortcuts, newest first. */
app.get('/api/links', (_req, res) => {
  res.json(getAllLinks());
});

/** POST /api/links — validate and create a shortcut. */
app.post('/api/links', (req, res) => {
  const shortname = String(req.body?.shortname ?? '').trim().toLowerCase();
  const url = String(req.body?.url ?? '').trim();

  if (!SHORTNAME.test(shortname)) {
    return res.status(400).json({ error: 'Use only lowercase letters, numbers and hyphens.' });
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error();
  } catch {
    return res.status(400).json({ error: 'Enter a valid URL, including https://' });
  }
  if (getLink(shortname)) {
    return res.status(409).json({ error: `go/${shortname} is already taken.` });
  }

  res.status(201).json(createLink(shortname, url));
});

/** GET /go/:shortname — resolve and redirect to the destination. */
app.get('/go/:shortname', (req, res) => {
  const link = getLink(req.params.shortname);
  if (!link) return res.status(404).send(`No shortcut found for go/${req.params.shortname}.`);
  res.redirect(302, link.url);
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Go Links API running on http://localhost:${PORT}`));
