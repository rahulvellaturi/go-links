# Go Links

An internal URL shortcut service. Create memorable shortnames like `go/payroll`
that redirect to long internal URLs, search the list, and visit `go/<name>` to be
redirected — with basic visit tracking on each link.

Full-stack: a React 19 + TypeScript frontend and an Express + SQLite backend.

## Stack

- Frontend: React 19 + TypeScript (Vite)
- Backend: Express + TypeScript
- Database: SQLite via Node's built-in `node:sqlite` (no native build; needs Node 22.13+)
- Validation: shared rules on client and server
- Tests: Vitest

## Run it

Requires Node 22.13 or newer (for the built-in `node:sqlite` module).

Install once — no compiler or Python needed, since there are no native dependencies:

```bash
npm install
```

Development (frontend + API together, with hot reload):

```bash
npm run dev
```

Vite serves the app (usually http://localhost:5173) and proxies `/api` and `/go`
to the Express API on port 3000.

Production-style single origin (Express serves the built app + API + redirects):

```bash
npm run build
npm start        # http://localhost:3000
```

Other scripts: `npm test` (unit tests), `npm run typecheck:server` (server types).

## API

- `GET /api/links` — list all shortcuts, newest first.
- `POST /api/links` — create one. Validates, blocks duplicates (409) and reserved names.
- `GET /go/:shortname` — resolve, record the visit, and 302-redirect to the destination.

Quick smoke test:

```bash
curl -X POST localhost:3000/api/links -H "Content-Type: application/json" \
  -d '{"shortname":"design-system","url":"https://figma.com/file/ds"}'
curl -i localhost:3000/go/design-system   # 302 with a Location header
curl -i localhost:3000/go/does-not-exist  # 404
```

## How it works

- Data — `server/src/db.ts` owns the SQLite schema and prepared queries, and seeds
  a few example links on first run.
- API — `server/src/routes.ts` handles list, create, and redirect; validation lives
  in `server/src/validation.ts`; request-id logging is middleware.
- Frontend — `src/services/linksApi.ts` is the only place that calls the API. A hook
  (`src/hooks/useLinks.ts`) owns loading/error state; components render the form,
  the searchable list, and per-link visit counts.

## Assumptions

- Shortnames are lowercase letters, numbers and hyphens, and are unique and
  case-insensitive (`Payroll` and `payroll` are the same link).
- Destinations must be absolute `http(s)` URLs so the redirect resolves.
- Names that would collide with app routes (`api`, `go`, `assets`, …) are reserved.
- Single-tenant. No auth or accounts.

## Tradeoffs I chose deliberately

- **Redirect namespaced under `/go/`** rather than a root catch-all, so it can never
  shadow API routes or static assets — safer than matching every unknown path.
- **`node:sqlite`** (Node's built-in SQLite) keeps the data layer simple and avoids a
  native build step entirely — no node-gyp, no compiler. Postgres would be the swap for
  a multi-instance deployment.
- **Validation duplicated on both sides** — instant client feedback, with the server
  as the source of truth (it still rejects a bad or duplicate request directly).
- **No auth, no edit/delete** — kept scope tight; both are natural next steps.

## If I had another day

- Auth and per-user ownership of links.
- Edit and delete, plus disabling a link without removing it.
- A "most visited" view built on the visit counts already tracked.
- Handle the create race (two users, same name) with the DB unique constraint surfaced
  as a clean 409 instead of a thrown error.
- Integration tests (supertest) over the routes, on top of the current unit tests.
