# Go Links

A small internal URL shortcut service. Create memorable aliases like `go/payroll`
that redirect to long internal URLs, browse existing shortcuts, and visit an alias
to be redirected.

Built as a first iteration — the kind of thing a team would keep developing.

## Stack

- React 19 + TypeScript
- Vite (dev server and build)
- Vitest (unit tests)
- No backend, no UI framework, no router — see tradeoffs below.

## Run it

```bash
npm install
npm run dev      # start the dev server (printed URL, usually http://localhost:5173)
```

Other scripts:

```bash
npm run build    # type-check and produce a production build
npm test         # run the unit tests once
```

## How it works

Three layers:

- **Data** — `public/shortcuts.json` stands in for a backend. On load the app does a
  real `fetch` over HTTP (`src/services/shortcutsApi.ts`), so swapping in a live API
  later touches only that one file.
- **State** — `src/hooks/useShortcuts.ts` owns the list plus `loading` and `error`
  state, and appends newly created shortcuts.
- **UI** — a create form with validation, a list with loading / error / empty states,
  and a redirect view resolved from the URL hash.

Visiting `#/go/:alias` resolves the alias and redirects to its destination.

## Assumptions

- Aliases are lowercase letters, numbers and hyphens — what reads cleanly after `go/`.
- Aliases are unique and case-insensitive (`Payroll` and `payroll` are the same link).
- Destinations must be absolute `http(s)` URLs so the redirect actually resolves.
- Single-user, single-tenant. No auth, no accounts.

## Tradeoffs I chose deliberately

- **In-memory writes.** Created shortcuts live in React state and reset on refresh.
  Persistence is the single most important next step, but it needs a real backend,
  which is out of scope for a time-boxed first iteration.
- **Static JSON as the API.** Real `fetch`, real loading/error handling, zero server
  to run. It demonstrates the integration boundary without the setup cost.
- **Hash routing, no library.** One redirect route doesn't justify React Router. The
  routing lives behind a hook, so adding a real router later is a contained change.
- **Validation as pure functions.** `src/lib/validation.ts` has no React in it, so the
  rules are unit-tested directly and reused by the form.

## If I had another day

- Persist shortcuts with a small backend (`POST /shortcuts`, `GET /go/:alias`) so links
  survive a refresh and can be shared.
- Add click tracking so teams can see which links are actually used.
- Edit and delete existing shortcuts.
- Component/interaction tests (React Testing Library) on top of the current unit tests.
- Handle alias collisions from concurrent users at the API layer.
