import { Router } from 'express';
import { getAllLinks, getLink, createLink, recordVisit } from './db';
import { validateShortname, validateUrl } from './validation';

export const router = Router();

/** GET /api/links — list all shortcuts, newest first. */
router.get('/api/links', (_req, res) => {
  res.json(getAllLinks());
});

/** POST /api/links — validate and create a shortcut. */
router.post('/api/links', (req, res) => {
  const { shortname = '', url = '' } = req.body ?? {};

  const nameCheck = validateShortname(shortname);
  if (!nameCheck.ok) return res.status(400).json({ error: nameCheck.error });

  const urlCheck = validateUrl(url);
  if (!urlCheck.ok) return res.status(400).json({ error: urlCheck.error });

  if (getLink(shortname)) {
    return res.status(409).json({ error: `go/${shortname.trim().toLowerCase()} is already taken.` });
  }

  const link = createLink(shortname, url);
  res.status(201).json(link);
});

/**
 * GET /go/:shortname — resolve and redirect. Namespaced under /go so it can
 * never shadow the API routes or the static frontend assets.
 */
router.get('/go/:shortname', (req, res) => {
  const link = getLink(req.params.shortname);
  if (!link) {
    return res.status(404).send(`No shortcut found for go/${req.params.shortname}.`);
  }
  recordVisit(req.params.shortname);
  res.redirect(302, link.url);
});
