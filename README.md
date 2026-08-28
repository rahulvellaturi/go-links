# Go Links

A small internal URL shortener I built for the take-home. You make a short name like `go/payroll`, and visiting it redirects to the full URL. You can also see all the links in one list.

## Running it

Needs Node 22.13 or newer (I use the SQLite built into Node, so there's nothing to install for the database).

```
npm install
npm run dev
```

The API runs on port 3000 and the frontend on 5173. Open http://localhost:5173. The database file is created and seeded with a few example links on the first run.

## API

- `GET /api/links` - list all shortcuts.
- `POST /api/links` - create one (validated; duplicates return 409).
- `GET /go/:shortname` - redirect to the destination (404 if unknown).

## Structure

- `server/src/db.ts` - SQLite schema, seed, and queries.
- `server/src/index.ts` - Express app: the three routes and validation.
- `src/` - React app: create form, list, and the API client.

## Assumptions

- Shortnames are lowercase letters, numbers and hyphens, unique and case-insensitive.
- Destinations must be absolute `http(s)` URLs.
- Single-user, no auth.

## Tradeoffs (scoped to the time box)

- **Writes go through the API to SQLite**, so links persist across restarts.
- **Validation on both sides** — instant client feedback, server as source of truth.
- **Redirect namespaced under `/go/`** so it never shadows the API or assets.

## Next steps

- Unit and integration tests.
- Visit tracking and a "most visited" view.
- Edit/delete, and auth for per-user links.
