# Team Decision Board

> **AI-powered collaborative decision intelligence platform** — teams propose, vote, discuss, and reach data-driven consensus in real time.

Built by **Guru, Harsh, and Gautam**.

---

## What It Does

Teams lose decisions to long email threads and noisy group chats. Team Decision Board replaces that with a structured, transparent flow:

1. A member posts a **proposal** with a description, options, and optional deadline
2. Every member votes **Agree / Neutral / Disagree** — one vote per person, changeable at any time
3. Live progress bars update for **all connected clients instantly** via Socket.io
4. When **70% agree** and **50% of members have participated**, consensus is detected automatically — the proposal is marked **Resolved**
5. Google Gemini AI generates an **executive summary, supporting/opposing arguments, outcome, and next action** and persists it to the database
6. Discussions happen in a real-time comment thread on the same page
7. Results can be **exported as Markdown or PDF**
8. A public share link lets stakeholders view results read-only — no account needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM 7, Tailwind CSS 3 |
| Charts | Recharts 2 |
| State / Auth | React Context API + localStorage (JWT) |
| Real-time | Socket.io 4 — team rooms, proposal rooms, personal user rooms |
| HTTP client | Axios (centralized interceptor for auth + error enrichment) |
| Backend | Node.js 18+, Express 4 (ES modules) |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini API (`gemini-1.5-flash`) via `@google/generative-ai` |
| Security | Helmet.js, express-rate-limit, express-validator |
| Export | Markdown (native), PDF (pdfkit) |

---

## Feature Highlights

### Core
- **JWT authentication** — register, login, update profile, change password, delete account
- **Team management** — create teams, join with invite code, view member list
- **Proposals** — title, description, custom options, optional deadline
- **Real-time voting** — Agree / Neutral / Disagree; vote changes detected and re-evaluated
- **Live results** — animated bars and counts update the instant any vote arrives
- **Comments** — live discussion thread pushed via socket to all viewers
- **Notifications** — targeted per-user socket rooms (`user:{id}`) for new proposals, comments, team joins
- **Public board** — shareable read-only URL, no login required

### AI & Intelligence (Phase 5)
- **Consensus Engine** — auto-resolves proposals at 70% agree + 50% participation
- **Google Gemini summaries** — generated fire-and-forget after resolution; gracefully skipped if API key is absent
- **AI summary persisted** — never regenerated for the same proposal; fields: `executiveSummary`, `supportingArguments[]`, `opposingArguments[]`, `outcome`, `nextAction`

### Analytics (Phase 6)
- Platform-wide stat cards: total teams, proposals, resolved count, acceptance rate, participation rate
- 14-day proposal creation trend (bar chart)
- All-time voting distribution (donut chart)
- Most active user & team highlight cards
- Recent activity feed preview

### Activity Timeline (Phase 7)
- Paginated audit log of all platform events (newest first)
- Live real-time prepend via `ACTIVITY_CREATED` socket event with slide-in animation
- 9 action types tracked with icons and human-readable labels

### Export (Phase 8)
- **Markdown** — full document: votes table, consensus banner, AI summary sections, discussion thread
- **PDF** — server-side via pdfkit; graceful 501 if package unavailable

### UI / UX (Phase 9)
- Skeleton loaders for all data-fetching states
- Resolved consensus banner with green gradient on ProposalDetails
- AI Summary panel with indigo/purple gradient — auto-shows on resolution, updates via socket
- Toast notification system with auto-dismiss (success / error / warn / info)

### Security (Phase 11)
- `helmet` with cross-origin resource policy
- Three-tier rate limiting: auth (20/15 min), API (120/min), heavy endpoints (10/min)
- `express-validator` input validation on all write endpoints
- No stack traces in production error responses
- Body size capped at 10 KB

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  BROWSER                     │
│  React 19 + Vite 7 + Tailwind CSS 3         │
│  Context: AuthContext · SocketContext        │
│  Pages: Dashboard · TeamBoard · Proposal     │
│         Analytics · ActivityTimeline         │
└──────────────┬──────────────┬───────────────┘
               │  HTTP/REST   │  WebSocket
               │  (Axios)     │  (Socket.io client)
┌──────────────▼──────────────▼───────────────┐
│              EXPRESS SERVER                  │
│  Helmet · Rate Limiter · JWT protect         │
│  Routes: /auth /teams /proposals             │
│          /analytics /activity /export        │
│  Socket.io: team rooms · proposal rooms      │
│             personal user:{id} rooms         │
└───────────┬─────────────────┬───────────────┘
            │                 │
   ┌────────▼────────┐  ┌────▼──────────────┐
   │    MongoDB       │  │  Google Gemini API │
   │  Users · Teams  │  │  gemini-1.5-flash  │
   │  Proposals      │  │  (fire-and-forget) │
   │  Activities     │  └───────────────────┘
   │  Notifications  │
   └─────────────────┘
```

---

## Socket.io Events Reference

| Event | Direction | Room | Payload |
|---|---|---|---|
| `join-team` / `leave-team` | client → server | — | `teamId` |
| `join-proposal` / `leave-proposal` | client → server | — | `proposalId` |
| `join-user` | client → server | — | `userId` |
| `proposal:created` | server → client | `team:{id}` | proposal object |
| `proposal:updated` | server → client | `proposal:{id}` | `{ proposalId, responses, totalVotes }` |
| `proposal:deleted` | server → client | `team:{id}` | `{ proposalId, teamId }` |
| `proposal:resolved` | server → client | `team:{id}` | `{ proposalId, consensusPercentage, closedAt }` |
| `vote:submitted` | server → client | `proposal:{id}` | `{ proposalId, responses, totalVotes }` |
| `vote:changed` | server → client | `proposal:{id}` | `{ proposalId, responses, totalVotes }` |
| `comment:added` | server → client | `proposal:{id}` | `{ proposalId, comment }` |
| `team:member-joined` | server → client | `team:{id}` | member info |
| `notification:new` | server → client | `user:{id}` | `{ type, title, message, link }` |
| `activity:created` | server → client | `team:{id}` | activity object |
| `ai:summary-ready` | server → client | `proposal:{id}` | `{ proposalId, summary }` |

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| PUT | `/api/auth/profile` | ✓ | Update name / email |
| PUT | `/api/auth/password` | ✓ | Change password |
| DELETE | `/api/auth/account` | ✓ | Delete account |

### Teams
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams` | ✓ | List user's teams |
| POST | `/api/teams` | ✓ | Create team |
| GET | `/api/teams/:id` | ✓ | Get team + proposals |
| POST | `/api/teams/:id` | ✓ | Join team |
| PUT | `/api/teams/:id` | ✓ | Update team |
| DELETE | `/api/teams/:id` | ✓ | Delete team (creator only) |

### Proposals
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/teams/:teamId/proposals` | ✓ | List proposals |
| POST | `/api/teams/:teamId/proposals` | ✓ | Create proposal |
| GET | `/api/proposals/:id` | ✓ | Get proposal + votes + comments |
| DELETE | `/api/proposals/:id` | ✓ | Delete proposal |
| **POST** | **`/api/proposals/:id/vote`** | ✓ | Cast or change vote |
| GET | `/api/proposals/:id/comments` | ✓ | List comments |
| POST | `/api/proposals/:id/comments` | ✓ | Add comment |

### Analytics / Activity / Export
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | ✓ | Platform-wide metrics |
| GET | `/api/activity?page=1&limit=20` | ✓ | Paginated activity feed |
| GET | `/api/export/proposal/:id?format=markdown` | ✓ | Export as Markdown |
| GET | `/api/export/proposal/:id?format=pdf` | ✓ | Export as PDF |

### Public / Misc
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/public/board/:shareId` | — | Read-only public board |
| GET | `/api/notifications` | ✓ | List notifications |
| PATCH | `/api/notifications/:id` | ✓ | Mark read |
| DELETE | `/api/notifications/:id` | ✓ | Delete one |
| DELETE | `/api/notifications` | ✓ | Clear all |
| POST | `/api/contact` | — | Submit contact message |
| GET | `/api/health` | — | Health check |

#### Vote Endpoint Body
```json
POST /api/proposals/:id/vote
{ "vote": "agree" | "neutral" | "disagree" }

→ { "message": "...", "responses": { "agree": 3, "neutral": 1, "disagree": 0 },
    "totalVotes": 4, "userVote": "agree" }
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- (Optional) [Google Gemini API key](https://aistudio.google.com/app/apikey) for AI summaries

### Install

```bash
git clone <repo-url>
cd Team-Dashboard

# Root convenience scripts install all three
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-dashboard
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional — AI summaries are skipped gracefully if absent
GEMINI_API_KEY=your_gemini_api_key_here
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### Run (Development)

```bash
npm run dev        # starts frontend (port 5173) + backend (port 5000) concurrently
```

Or separately:
```bash
npm --prefix backend run dev    # backend only (nodemon)
npm --prefix frontend run dev   # frontend only (Vite HMR)
```

### Build (Production)

```bash
cd frontend && npm run build    # outputs to frontend/dist/
```

---

## Folder Structure

```
Team-Dashboard/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── proposalController.js   ← voting + consensus trigger
│   │   ├── analyticsController.js
│   │   ├── activityController.js
│   │   └── exportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       ← JWT protect
│   │   ├── errorHandler.js         ← no stack traces in prod
│   │   └── rateLimiter.js          ← auth / api / heavy tiers
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Proposal.js             ← votes[], aiSummary, consensusReached
│   │   ├── Activity.js             ← audit log
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js · teams.js · proposals.js
│   │   ├── analytics.js · activity.js · export.js
│   │   └── public.js · notifications.js · contact.js
│   ├── services/
│   │   ├── consensusService.js     ← pure evaluateConsensus() function
│   │   ├── aiSummaryService.js     ← Gemini integration, graceful fallback
│   │   └── activityService.js      ← fire-and-forget logActivity()
│   └── utils/
│       ├── generateToken.js
│       └── socketEvents.js         ← typed emit helpers
└── frontend/src/
    ├── api/index.js                ← Axios + all API namespaces
    ├── components/
    │   ├── common/
    │   │   ├── SkeletonLoader.jsx  ← Skeleton, ProposalSkeleton, StatSkeleton
    │   │   ├── Toast.jsx           ← ToastContainer
    │   │   └── ProtectedRoute.jsx
    │   ├── cards/
    │   │   ├── TeamCard.jsx
    │   │   └── ProposalCard.jsx    ← mini tricolor vote bar
    │   └── layout/Navbar.jsx · Footer.jsx
    ├── context/
    │   ├── AuthContext.jsx         ← useCallback-stable login/logout
    │   └── SocketContext.jsx       ← room join/leave + user:{id} room
    ├── hooks/useToast.js
    ├── pages/
    │   ├── Analytics.jsx           ← recharts bar + donut + stat cards
    │   ├── ActivityTimeline.jsx    ← paginated + live socket feed
    │   ├── ProposalDetails.jsx     ← voting + AI summary + export
    │   ├── Dashboard.jsx · TeamBoard.jsx
    │   ├── LandingPage.jsx · Profile.jsx
    │   └── Notifications.jsx · PublicBoard.jsx
    └── utils/constants.js · helpers.js
```

---

## Consensus Algorithm

The consensus engine is a **pure function** in `backend/services/consensusService.js`:

```js
// Thresholds
const AGREE_THRESHOLD       = 70;  // % of votes that must be "agree"
const PARTICIPATION_THRESHOLD = 50; // % of team members that must have voted

export const evaluateConsensus = (votes, memberCount) => {
  const agreeCount  = votes.filter((v) => v.vote === 'agree').length;
  const totalVotes  = votes.length;
  const agreePercentage     = (agreeCount / totalVotes) * 100;
  const participationRate   = (totalVotes / memberCount) * 100;
  const reached = agreePercentage >= AGREE_THRESHOLD && participationRate >= PARTICIPATION_THRESHOLD;
  return { reached, agreePercentage, participationRate, totalVotes };
};
```

When `reached === true`, the controller:
1. Sets `proposal.status = 'resolved'`, `closedAt`, `consensusPercentage`
2. Emits `proposal:resolved` to the team room
3. Creates targeted `notification:new` events for every member
4. Triggers AI summary via `setImmediate()` (non-blocking)
5. Logs a `proposal.resolved` activity

---

## AI Summary Flow

```
Vote endpoint response sent to client
         │
         └─ setImmediate(() => generateAiSummary(proposal))
                  │
                  ├─ if GEMINI_API_KEY missing → return null (silent)
                  ├─ if aiSummary.generatedAt exists → return null (no regen)
                  ├─ call gemini-1.5-flash with structured prompt
                  ├─ parse JSON from response (handles markdown code blocks)
                  ├─ save to proposal.aiSummary
                  └─ emit  ai:summary-ready  → proposal room
                           (frontend updates panel without page reload)
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Socket not connecting | `CLIENT_URL` in `backend/.env` must match Vite port (default 5173) |
| 404 on API calls | `VITE_API_URL` in `frontend/.env` must match backend port |
| AI summary never appears | Add `GEMINI_API_KEY` to `backend/.env`; check backend logs for `[AI]` prefix |
| PDF export returns 501 | Run `npm install pdfkit` in `backend/` |
| Stale Tailwind styles | Delete `frontend/node_modules/.vite` and restart Vite |
| Rate limit 429 errors | Default: 120 req/min for API, 20 req/15 min for auth |
| Vote not saving | Ensure `JWT_SECRET` is set; check `Authorization: Bearer <token>` header |
