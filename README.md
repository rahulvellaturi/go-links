# Go Links

An internal URL shortcut service. Create memorable shortnames like `go/payroll`
that redirect to long internal URLs, browse the list, and visit `go/<name>` to be
redirected.

React 19 + TypeScript frontend, Express + SQLite backend.

## Requirements

Node 22.13+ (uses Node's built-in `node:sqlite` — no native build, no compiler).

## Run

```bash
npm install
npm run dev
```

`npm run dev` starts the API (port 3000) and the frontend (port 5173) together.
Vite proxies `/api` and `/go` to the API. Open http://localhost:5173.

The SQLite file (`go-links.db`) and its table are created automatically on first
run, seeded with a few example links.

## API

- `GET /api/links` — list all shortcuts.
- `POST /api/links` — create one (validated; duplicates return 409).
- `GET /go/:shortname` — redirect to the destination (404 if unknown).

## Structure

- `server/src/db.ts` — SQLite schema, seed, and queries.
- `server/src/index.ts` — Express app: the three routes and validation.
- `src/` — React app: create form, list, and the API client.

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
