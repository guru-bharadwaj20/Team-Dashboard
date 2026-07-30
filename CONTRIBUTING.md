# Contributing

## Setup

This repository is a single npm workspace. Install everything from the root:

```bash
git clone https://github.com/guru-bharadwaj20/Team-Dashboard.git
cd Team-Dashboard
npm install          # installs shared, backend and frontend together
```

Copy the environment templates and fill them in:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env.example` documents every variable. At minimum you need `MONGO_URI`
and a `JWT_SECRET` of at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then run both servers:

```bash
npm run dev          # API on :5000, web on :5173
```

## Layout

```
shared/        Contract used by both sides: socket event names, activity tables,
               status labels. Change it here or the two halves drift apart.
backend/       Express API, Mongoose models, Socket.io
frontend/      React + Vite SPA
```

## Commands

All are run from the repository root.

| Command | What it does |
|---|---|
| `npm run dev` | Both servers with named, coloured output |
| `npm start` | API only, production mode |
| `npm run build` | Production build of the SPA |
| `npm run lint` | ESLint over backend and frontend |
| `npm test` | Backend test suite (`node --test`) |
| `npm run migrate:comments` | One-off migration, dry run by default |

Target a single workspace with `-w`, e.g. `npm run lint -w backend`.

## Before opening a pull request

```bash
npm run lint && npm test && npm run build
```

CI runs exactly this across Node 18, 20 and 22, plus a check that no `.env` file
is tracked.

## Conventions

- **Never commit a `.env` file.** One was committed to this repository before;
  see [SECURITY.md](SECURITY.md). CI fails the build if it happens again.
- Prefix commits with the area: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`, `perf:`, `security:`, `build:`, `ci:`.
- **Server logging goes through `utils/logger.js`.** `no-console` is an error in
  the backend; the logger is the only exception.
- **Validate at the route, not in the controller.** Add a chain to
  `backend/middleware/validate.js` and mount it on the route.
- **Team-scoped data needs a guard.** Anything belonging to a team must sit
  behind `requireTeamMember`, `requireTeamCreator` or `requireProposalMember`
  from `backend/middleware/teamAuth.js`. Never rely on the UI hiding a control.
- **Socket events are never broadcast.** Emit to a team, proposal or user room —
  there is no `io.emit` helper, deliberately.
- **Adding a socket event or activity action?** Add it to `shared/events.js`
  first, and give an activity action a label there too.

## Testing

Tests live in `backend/tests/` and use Node's built-in runner — no framework.
Pure functions (consensus rules, validators, sanitisers) are the priority: they
carry the logic where a silent regression is most costly.

```bash
npm test
node --test backend/tests/consensus.test.js   # a single file
```

## Accessibility

Interactive work should keep the app usable from a keyboard and a screen reader:
dialogs trap focus and close on Escape, icon-only buttons carry an accessible
name, decorative emoji are `aria-hidden`, state is conveyed by more than colour,
and form errors are announced via `aria-live`.
