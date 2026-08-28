# Go Links

A small internal URL shortener I built for the take-home. You make a short name like `go/payroll`, and visiting it redirects to the full URL. You can also see all the links in one list.

## Quick start

Prerequisites: Node 18+ and npm.

- Install dependencies

```bash
npm ci
```

- Run dev server

```bash
npm run dev
```

- Build for production

```bash
npm run build
```

- Run tests

```bash
npm test
```

CI: A GitHub Actions workflow runs build + tests on push and PRs (`.github/workflows/ci.yml`).

## Running it

Needs Node 22.13 or newer (I use the SQLite built into Node, so there's nothing to install for the database).

```
npm install
npm run dev
```

The API runs on port 3000 and the frontend on 5173. Open http://localhost:5173. The database file is created and seeded with a few example links on the first run.

## How it's built

Three parts, each with one job:

- Frontend (React + TypeScript) — the form and the list. Talks to the backend over HTTP; never touches the database.
- Backend (Express) — three endpoints: list links, create a link, and the redirect at `/go/:name`. It validates every create.
- Database (SQLite) — stores the links, reached only through the backend.

Links persist in SQLite, so they survive a restart. I validate input on the form (quick feedback) and again on the server (the real check), and duplicate names are rejected.

## Project structure

```
server/
  src/
    db.ts        SQLite setup, seed, and the queries
    index.ts     Express app: the three routes and validation
src/
  types/         the Link type
  lib/           client-side validation
  services/      the API client (fetch calls)
  hooks/         list + loading/error state
  components/    the form and the list
  App.tsx        puts it together
vite.config.ts   dev server + proxy to the API
```

## Can it scale?

For one team, yes — it's simple and fast. It's built for a single instance, since SQLite is a file next to the app. To go company-wide, the main change is moving to a networked database like Postgres so multiple copies of the app share the data; after that, an index on the short name, pagination, and login.