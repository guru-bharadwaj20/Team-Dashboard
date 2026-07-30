# Team Decision Board

> An AI-powered collaborative decision intelligence platform where teams propose ideas, vote democratically, detect consensus automatically, and generate structured AI-backed decision summaries — all in real time.

Built with the **MERN Stack**, **Socket.io**, and **Google Gemini AI**.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Consensus Algorithm](#consensus-algorithm)
- [AI Summary Flow](#ai-summary-flow)
- [Socket.io Events](#socketio-events-reference)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Contributing](#contributing)
- [Authors](#authors)

---

## Overview

Traditional team discussions get fragmented across emails and group chats, making it hard to track decisions or understand the reasoning behind them.

**Team Decision Board** replaces that with a structured, transparent workflow:

1. A member posts a **proposal** with a description and options
2. Every member votes **Agree / Neutral / Disagree** — changeable at any time
3. Live progress bars update across all connected clients instantly via Socket.io
4. When **70% agree** and **50% of members have voted**, consensus is detected automatically — the proposal is marked **Resolved**
5. **Google Gemini** generates an executive summary with arguments, outcome, and next steps, persisted to the database
6. Discussions happen in a real-time comment thread on the same page
7. Results can be exported as **Markdown or PDF**
8. A public share link lets stakeholders view results read-only — no account needed

---

## Key Features

### Authentication & User Management
- JWT-based authentication with register, login, and logout
- Profile management: update name, email, and password
- Account deletion with cascading cleanup
- All routes protected via middleware

### Team Management
- Create teams and join via invite
- View team members and their activity
- Public read-only board sharing via shareable link (no login required)

### Proposals & Voting
- Create proposals with title, description, and optional custom options
- Vote **Agree / Neutral / Disagree** — votes can be changed until consensus is reached
- Live vote counts and animated progress bars via Socket.io

### Real-Time Collaboration (Socket.io)
- Team rooms, proposal rooms, and personal user rooms (`user:{id}`)
- Live updates for proposal creation, vote changes, comments, resolution, and notifications
- No page refresh required at any point

### Consensus Engine
- Auto-resolves proposals when ≥ 70% agree and ≥ 50% of members have participated
- On resolution: emits `proposal:resolved`, triggers AI summary, dispatches per-user notifications, and logs activity — all non-blocking

### AI-Powered Decision Summaries (Google Gemini)
- Triggered automatically via `setImmediate()` after consensus — never blocks the vote response
- Generated only once per proposal; never regenerated
- Structured output: Executive Summary, Supporting Arguments, Opposing Arguments, Final Outcome, Suggested Next Action
- Pushed to all connected clients via `ai:summary-ready` socket event

### Analytics Dashboard
- Platform-wide stat cards: total teams, proposals, resolved count, acceptance rate, participation rate
- 14-day proposal trend (bar chart) and all-time voting distribution (donut chart) via Recharts
- Most active member and team highlight cards
- Recent activity feed preview

### Activity Timeline
- Paginated audit log of all platform events (9 action types)
- Live prepend via `ACTIVITY_CREATED` socket event with slide-in animation

### Export
- **Markdown** — full document with vote table, consensus banner, AI summary, and discussion thread
- **PDF** — server-side via PDFKit

### Security
- Session held in an **httpOnly cookie** — unreadable from JavaScript, so an XSS
  bug cannot exfiltrate it. `Secure` + `SameSite=None` in production.
- **Socket.io handshakes are authenticated**; the personal notification room is
  derived from the verified token, never from a client-supplied id.
- **Team membership is the privacy boundary.** Every team-scoped route sits
  behind `requireTeamMember`, `requireTeamCreator` or `requireProposalMember`.
  Joining requires a share code, not a team id.
- `helmet` with a `default-src 'none'` CSP, `frame-ancestors 'none'` and
  `no-referrer`
- Four-tier rate limiting: register (5 / hour), auth (20 / 15 min),
  API (120 / min), heavy endpoints (10 / min), keyed on the real client IP via
  `trust proxy`
- `express-validator` chains on every write endpoint, plus a global sanitiser
  that strips Mongo operators (`$gt`, dotted keys) from body, query and params
- Password policy: 8+ characters with a letter and a digit, bcrypt cost 12
- No stack traces or driver messages in production error responses
- Request body capped at 10 KB

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM 7, Tailwind CSS 3 |
| Charts | Recharts 2 |
| State / Auth | React Context API + httpOnly cookie session |
| Real-time | Socket.io 4 |
| HTTP Client | Axios (centralized interceptor for auth + error enrichment) |
| Backend | Node.js 18.18+, Express 4 (ES Modules) |
| Database | MongoDB + Mongoose 7 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai` |
| Security | Helmet (CSP), express-rate-limit, express-validator, operator sanitiser |
| Export | Markdown (native), PDF (PDFKit) |
| Tooling | npm workspaces, ESLint (both packages), `node --test` |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   BROWSER                    │
│   React 19 + Vite 7 + Tailwind CSS 3        │
│   Context: AuthContext · SocketContext       │
│   Pages: Dashboard · TeamBoard · Proposal   │
│           Analytics · ActivityTimeline      │
└──────────────┬──────────────┬───────────────┘
               │  HTTP/REST   │  WebSocket
               │  (Axios)     │  (Socket.io client)
┌──────────────▼──────────────▼───────────────┐
│               EXPRESS SERVER                 │
│   Helmet · Rate Limiter · JWT protect        │
│   Routes: /auth /teams /proposals            │
│            /analytics /activity /export      │
│   Socket.io: team rooms · proposal rooms     │
│               personal user:{id} rooms       │
└───────────┬─────────────────┬───────────────┘
            │                 │
   ┌────────▼────────┐  ┌────▼──────────────┐
   │    MongoDB       │  │  Google Gemini API │
   │  Users · Teams  │  │  gemini-2.5-flash  │
   │  Proposals      │  │  (fire-and-forget) │
   │  Comments       │  └───────────────────┘
   │  Activities     │
   │  Notifications  │
   └─────────────────┘

shared/events.js holds the socket event names, activity tables and status
labels that both halves import, so the contract cannot drift.
```

---

## Consensus Algorithm

The consensus engine is a **pure function** in `backend/services/consensusService.js`,
covered by unit tests in `backend/tests/consensus.test.js`:

```js
const AGREE_THRESHOLD         = 0.70;  // share of votes that must be "agree"
const PARTICIPATION_THRESHOLD = 0.50;  // share of members that must have voted
const MIN_VOTES               = 2;     // absolute floor on turnout

export const evaluateConsensus = (votes, memberCount) => {
  const totalVotes        = votes.length;
  const agreeCount        = votes.filter((v) => v.vote === 'agree').length;
  const agreePercentage   = (agreeCount / totalVotes) * 100;
  const participationRate = memberCount > 0 ? (totalVotes / memberCount) * 100 : 0;

  const reached =
    memberCount >= MIN_VOTES &&
    totalVotes  >= MIN_VOTES &&
    agreePercentage   >= AGREE_THRESHOLD * 100 &&
    participationRate >= PARTICIPATION_THRESHOLD * 100;

  return { reached, agreePercentage, participationRate, totalVotes };
};
```

`MIN_VOTES` matters more than it looks: percentages alone are degenerate at small
n. Without it a two-person team hit both thresholds on a **single** agree vote —
100% agreement, 50% participation — and resolved the proposal before the second
member had seen it.

When `reached === true`, the controller:
1. Claims the transition with an update conditioned on `consensusReached: false`,
   so exactly one of several concurrent voters fires the side effects
2. Sets `status = 'resolved'`, `closedAt` and `consensusPercentage`
3. Emits `proposal:resolved` to **both** the team room and the proposal room —
   anyone viewing the proposal is only in the latter
4. Creates targeted `notification:new` events for every member except the voter
5. Triggers AI summary generation via `setImmediate()` (non-blocking)
6. Logs a `proposal.resolved` activity entry

Votes are written with a single conditional `findOneAndUpdate` rather than a
read-modify-write, so two simultaneous votes cannot lose one.

### Deadlines

A proposal with a deadline is closed once it passes, both lazily (when anyone
reads or votes on it) and by a sweep every five minutes
(`backend/services/deadlineService.js`). Votes after the deadline are rejected.

---

## AI Summary Flow

```
Vote response sent to client
        │
        └── setImmediate(() => generateAiSummary(proposal))
                │
                ├── GEMINI_API_KEY missing  →  return null (silent)
                ├── aiSummary.generatedAt exists  →  return null (no regen)
                ├── Call gemini-2.5-flash with structured prompt
                ├── Parse JSON from response (handles markdown code fences)
                ├── Save to proposal.aiSummary
                └── Emit  ai:summary-ready  →  proposal room
                          (frontend updates panel without page reload)
```

---

## Socket.io Events Reference

Every connection is authenticated during the handshake from the auth cookie; an
unauthenticated socket is rejected before any event is handled. There is no
broadcast helper — every event goes to a team, proposal or user room.

| Event | Direction | Room | Payload |
|---|---|---|---|
| `join-team` / `leave-team` | client → server | — | `teamId` |
| `join-proposal` / `leave-proposal` | client → server | — | `proposalId` |
| `team:updated` | server → client | `team:{id}` | `{ teamId, name, description }` |
| `team:deleted` | server → client | `team:{id}` | `{ teamId, teamName }` |
| `team:member-joined` | server → client | `team:{id}` | `{ teamId, member, memberCount }` |
| `proposal:created` | server → client | `team:{id}` | `{ proposal, teamId, creator }` |
| `proposal:updated` | server → client | `proposal:{id}` | `{ proposalId, responses, totalVotes, status }` |
| `proposal:deleted` | server → client | `team:{id}` | `{ proposalId, teamId }` |
| `proposal:resolved` | server → client | `team:{id}` **and** `proposal:{id}` | `{ proposalId, consensusPercentage, closedAt, title }` |
| `proposal:status-changed` | server → client | `team:{id}` + `proposal:{id}` | `{ proposalId, status, closedAt }` — deadline close |
| `vote:submitted` | server → client | `proposal:{id}` | `{ proposalId, responses, totalVotes, userId, vote }` |
| `vote:changed` | server → client | `proposal:{id}` | as above, plus `previousVote` |
| `comment:added` | server → client | `proposal:{id}` | `{ proposalId, comment }` |
| `notification:new` | server → client | `user:{id}` | the persisted notification document |
| `activity:created` | server → client | `team:{id}` | activity object |
| `ai:summary-ready` | server → client | `proposal:{id}` | `{ proposalId, summary }` |

There is deliberately no `join-user` event: the personal room is joined
server-side from the verified token, so a client cannot subscribe to someone
else's notifications. Event names live in `shared/events.js`, imported by both
the server and the SPA.

---

## API Reference

All authenticated routes read the session from the `token` httpOnly cookie, with
a `Bearer` header accepted as a fallback for non-browser clients. Team-scoped
routes additionally require membership of the team in question — a 403 otherwise.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register; sets the session cookie |
| POST | `/api/auth/login` | — | Log in; sets the session cookie |
| POST | `/api/auth/logout` | — | Clears the session cookie |
| GET | `/api/auth/me` | ✓ | Current user — used to revalidate a session on boot |
| PUT | `/api/auth/profile` | ✓ | Update name / email |
| PUT | `/api/auth/password` | ✓ | Change password |
| DELETE | `/api/auth/account` | ✓ | Delete account and cascade |

### Teams

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams` | ✓ | List **only the teams the caller belongs to** |
| POST | `/api/teams` | ✓ | Create team |
| POST | `/api/teams/join` | ✓ | Join via `{ shareId }` — the team's share code |
| GET | `/api/teams/:id` | member | Team + paginated proposals |
| PUT | `/api/teams/:id` | creator | Update name / description |
| DELETE | `/api/teams/:id` | creator | Delete team and cascade |

Joining by raw team id is not offered: ObjectIds are enumerable and would let
anyone insert themselves into an arbitrary team.

### Proposals

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams/:teamId/proposals` | member | Paginated list |
| POST | `/api/teams/:teamId/proposals` | member | Create proposal |
| GET | `/api/proposals/:id` | member | Proposal + tallies + your vote |
| DELETE | `/api/proposals/:id` | member | Delete (creator only) |
| POST | `/api/proposals/:id/vote` | member | Cast or change a vote |
| GET | `/api/proposals/:id/comments` | member | Paginated thread |
| POST | `/api/proposals/:id/comments` | member | Add a comment |

#### Vote Endpoint

```jsonc
POST /api/proposals/:id/vote
{ "vote": "agree" | "neutral" | "disagree" }

// 200
{
  "message": "Vote recorded",
  "responses": { "agree": 3, "neutral": 1, "disagree": 0 },
  "totalVotes": 4,
  "userVote": "agree",
  "consensusReached": false,
  "consensusPercentage": 0,
  "status": "open"
}
```

Returns `400` if the proposal is closed or past its deadline, and `409` if a
concurrent write won the race (retry).

### Analytics, Activity & Export

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | ✓ | Metrics **for the caller's teams only** |
| GET | `/api/activity?page=1&limit=20` | ✓ | Paginated activity feed |
| GET | `/api/export/proposal/:id?format=markdown` | member | Export as Markdown |
| GET | `/api/export/proposal/:id?format=pdf` | member | Export as PDF |

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | ✓ | List your notifications |
| PATCH | `/api/notifications/:id` | ✓ | Mark one as read |
| DELETE | `/api/notifications/:id` | ✓ | Delete one |
| DELETE | `/api/notifications` | ✓ | Clear all |

### Public & Misc

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/public/board/:shareId` | — | Read-only public board |
| POST | `/api/contact` | — | Submit a contact message |
| GET | `/api/health` | — | Health check; 503 when the database is down |

### Contact administration

These serve and mutate third-party PII, so they require an authenticated user
with `role: "admin"`. Promote an account by setting the field directly in
MongoDB — there is no self-service path.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/contact` | admin | List all submissions |
| GET | `/api/contact/:id` | admin | Read one |
| PUT | `/api/contact/:id/status` | admin | Set `new` / `read` / `responded` |
| DELETE | `/api/contact/:id` | admin | Delete one |

### Errors

Every failure returns JSON, including unmatched routes:

```jsonc
{ "message": "Options must be unique",
  "errors": [ { "field": "options", "message": "Options must be unique" } ] }
```

`message` always holds the first problem; `errors[]` appears on validation
failures. Stack traces are included in development only.

---

## Project Structure

```
Team-Dashboard/
├── shared/
│   └── events.js                  # socket names, activity + status tables
│                                  # imported by BOTH packages
├── backend/
│   ├── config/db.js
│   ├── controllers/               # auth, team, proposal, analytics,
│   │                              # activity, notification, contact, export,
│   │                              # public
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect, adminOnly
│   │   ├── teamAuth.js            # requireTeamMember / Creator / ProposalMember
│   │   ├── socketAuth.js          # Socket.io handshake verification
│   │   ├── validate.js            # express-validator chains, one per endpoint
│   │   ├── sanitize.js            # strips Mongo operators from all input
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js        # + notFoundHandler
│   │   └── rateLimiter.js
│   ├── models/                    # User, Team, Proposal, Comment,
│   │                              # Notification, Activity, Contact
│   ├── routes/
│   ├── services/
│   │   ├── consensusService.js    # pure; unit tested
│   │   ├── deadlineService.js     # lazy close + periodic sweep
│   │   ├── cascadeService.js      # referential cleanup, transactional
│   │   ├── activityService.js
│   │   └── aiSummaryService.js
│   ├── utils/                     # logger, validators, authCookie, socketEvents
│   ├── scripts/migrate-comments.js
│   ├── tests/                     # node --test
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/index.js           # axios, cookie session, 401 handling
│       ├── components/
│       │   ├── cards/  common/    # Modal, ErrorBoundary, Toast, Loader…
│       │   ├── layout/ modals/
│       ├── context/               # providers + contexts.js
│       ├── hooks/                 # useAuth, useSocket, useToastContext, useToast
│       ├── pages/                 # lazy-loaded routes
│       └── utils/
├── .github/workflows/ci.yml
├── CONTRIBUTING.md
├── SECURITY.md
└── package.json                   # npm workspace root
```

---

## Local Setup

### Prerequisites

- Node.js **18.18+**
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Google Gemini API key *(optional — AI summaries are skipped gracefully if absent)*

### 1. Clone and install

This is a single **npm workspace**: one install at the root covers `shared`,
`backend` and `frontend`.

```bash
git clone https://github.com/guru-bharadwaj20/Team-Dashboard.git
cd Team-Dashboard
npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env.example` documents every variable. At minimum set `MONGO_URI` and
a `JWT_SECRET` of 32+ characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Prepare the database *(optional)*

Creates collections, schema validators and indexes. Idempotent, and seeds nothing.

```bash
mongosh "$MONGO_URI" backend/setup-database.mongodb.js
```

Upgrading an existing database from before comments were extracted into their
own collection? Run the migration — dry run by default:

```bash
npm run migrate:comments              # report only
npm run migrate:comments -- --apply   # perform it
```

### 4. Run

```bash
npm run dev     # API on :5000, web on :5173
```

Or target one workspace:

```bash
npm run dev -w backend     # nodemon
npm run dev -w frontend    # Vite HMR
```

### 5. Verify and build

```bash
npm run lint     # ESLint over backend and frontend
npm test         # backend test suite
npm run build    # SPA -> frontend/dist/
```

CI runs exactly these three across Node 18, 20 and 22.

---

## Production Deployment

| Component | Recommended Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway / Render |
| Database | MongoDB Atlas |

Set on the backend:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` — required; it is what makes the session cookie `Secure` |
| `CLIENT_URL` | Your SPA origin. Comma-separate to allow previews. |
| `TRUST_PROXY_HOPS` | `1` on Render/Railway/Fly, so rate limits key on the real client IP |
| `JWT_SECRET` | 32+ random characters, **not** the value from any example |
| `MONGO_URI` | Atlas connection string |

Set `VITE_API_URL` on the frontend to the API origin plus `/api`.

The session is a cross-site cookie in production, which browsers only accept as
`Secure` + `SameSite=None`. **Both** the SPA and the API must be served over
HTTPS, or sign-in will appear to succeed and then immediately fail.

Account deletion and team deletion run inside a MongoDB transaction where the
deployment supports one — Atlas and any replica set do. On a standalone `mongod`
they fall back to sequential execution.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Socket not connecting | `CLIENT_URL` must match the browser origin exactly. It accepts a comma-separated list. The handshake needs the auth cookie, so a cross-origin setup requires HTTPS in production (`SameSite=None` implies `Secure`). |
| Logged out immediately after signing in | The session cookie was rejected. Check `CLIENT_URL`, and that the SPA and API are both on HTTPS in production. |
| 401 on every request | `JWT_SECRET` changed, which invalidates all existing sessions. Sign in again. |
| 403 "You are not a member of this team" | Working as intended — team data is private to members. Join with the team's share code. |
| 404 on API calls | `VITE_API_URL` must match the backend port and include `/api`. |
| Can't reach the contact admin routes | They require `role: "admin"`; set it on your user document in MongoDB. |
| AI summary never appears | Add `GEMINI_API_KEY` and check the logs for the `[AI]` prefix. |
| PDF export returns 501 | `npm install pdfkit -w backend` |
| Rate limit 429 errors | Register 5/hour, auth 20/15min, API 120/min, exports 10/min. Behind a proxy, set `TRUST_PROXY_HOPS`. |
| `/api/health` returns 503 | The database is not connected — that is what the endpoint reports. |
| Stale Tailwind styles | Delete `frontend/node_modules/.vite` and restart Vite. |

---

## Future Improvements

- Semantic search using vector embeddings
- AI-powered duplicate proposal detection
- Email notifications, and email verification (which would close the account
  enumeration noted in [SECURITY.md](SECURITY.md))
- Finer-grained roles beyond member / creator / admin
- Docker and Kubernetes support
- End-to-end and integration test coverage — the current suite covers pure units
- Mobile application

Delivered since the first release: role-based access control, a CI pipeline,
and a unit test suite.

---

## Testing

```bash
npm test
```

Runs `node --test` over `backend/tests/` — no framework. Coverage focuses on the
pure units where a regression would otherwise be silent: the consensus rules,
the validators, and the Mongo-operator sanitiser. The tests encode real defects
found during the audit, so they fail if any is reintroduced.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the command table, and the
conventions this codebase follows. Security policy and the credential-rotation
notice are in [SECURITY.md](SECURITY.md).

---

## Authors

- **Guru**
- **Harsh**
- **Gautam**

---

## License

[MIT](LICENSE).