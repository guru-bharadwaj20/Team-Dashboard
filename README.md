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
- `helmet` with cross-origin resource policy
- Three-tier rate limiting: auth (20 req / 15 min), API (120 req / min), heavy endpoints (10 req / min)
- `express-validator` on all write endpoints
- No stack traces in production error responses
- Request body capped at 10 KB

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM 7, Tailwind CSS 3 |
| Charts | Recharts 2 |
| State / Auth | React Context API + localStorage (JWT) |
| Real-time | Socket.io 4 |
| HTTP Client | Axios (centralized interceptor for auth + error enrichment) |
| Backend | Node.js 18+, Express 4 (ES Modules) |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini API (`gemini-1.5-flash`) via `@google/generative-ai` |
| Security | Helmet.js, express-rate-limit, express-validator |
| Export | Markdown (native), PDF (PDFKit) |

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
   │  Users · Teams  │  │  gemini-1.5-flash  │
   │  Proposals      │  │  (fire-and-forget) │
   │  Activities     │  └───────────────────┘
   │  Notifications  │
   └─────────────────┘
```

---

## Consensus Algorithm

The consensus engine is a **pure function** in `backend/services/consensusService.js`:

```js
const AGREE_THRESHOLD         = 70;  // % of votes that must be "agree"
const PARTICIPATION_THRESHOLD = 50;  // % of team members that must have voted

export const evaluateConsensus = (votes, memberCount) => {
  const agreeCount        = votes.filter((v) => v.vote === 'agree').length;
  const totalVotes        = votes.length;
  const agreePercentage   = (agreeCount / totalVotes) * 100;
  const participationRate = (totalVotes / memberCount) * 100;
  const reached = agreePercentage >= AGREE_THRESHOLD && participationRate >= PARTICIPATION_THRESHOLD;

  return { reached, agreePercentage, participationRate, totalVotes };
};
```

When `reached === true`, the controller:
1. Sets `proposal.status = 'resolved'`, `closedAt`, and `consensusPercentage`
2. Emits `proposal:resolved` to the team room
3. Creates targeted `notification:new` events for every member
4. Triggers AI summary generation via `setImmediate()` (non-blocking)
5. Logs a `proposal.resolved` activity entry

---

## AI Summary Flow

```
Vote response sent to client
        │
        └── setImmediate(() => generateAiSummary(proposal))
                │
                ├── GEMINI_API_KEY missing  →  return null (silent)
                ├── aiSummary.generatedAt exists  →  return null (no regen)
                ├── Call gemini-1.5-flash with structured prompt
                ├── Parse JSON from response (handles markdown code fences)
                ├── Save to proposal.aiSummary
                └── Emit  ai:summary-ready  →  proposal room
                          (frontend updates panel without page reload)
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
| POST | `/api/proposals/:id/vote` | ✓ | Cast or change vote |
| GET | `/api/proposals/:id/comments` | ✓ | List comments |
| POST | `/api/proposals/:id/comments` | ✓ | Add comment |

#### Vote Endpoint

```json
POST /api/proposals/:id/vote
{ "vote": "agree" | "neutral" | "disagree" }

Response:
{
  "message": "...",
  "responses": { "agree": 3, "neutral": 1, "disagree": 0 },
  "totalVotes": 4,
  "userVote": "agree"
}
```

### Analytics, Activity & Export

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics` | ✓ | Platform-wide metrics |
| GET | `/api/activity?page=1&limit=20` | ✓ | Paginated activity feed |
| GET | `/api/export/proposal/:id?format=markdown` | ✓ | Export as Markdown |
| GET | `/api/export/proposal/:id?format=pdf` | ✓ | Export as PDF |

### Public & Misc

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/public/board/:shareId` | — | Read-only public board |
| GET | `/api/notifications` | ✓ | List notifications |
| PATCH | `/api/notifications/:id` | ✓ | Mark as read |
| DELETE | `/api/notifications/:id` | ✓ | Delete one |
| DELETE | `/api/notifications` | ✓ | Clear all |
| POST | `/api/contact` | — | Submit contact message |
| GET | `/api/health` | — | Health check |

---

## Project Structure

```
Team-Dashboard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   ├── proposalController.js       # voting + consensus trigger
│   │   ├── analyticsController.js
│   │   ├── activityController.js
│   │   └── exportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT protect
│   │   ├── errorHandler.js              # no stack traces in prod
│   │   └── rateLimiter.js               # auth / api / heavy tiers
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Proposal.js                  # votes[], aiSummary, consensusReached
│   │   ├── Activity.js                  # audit log
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teams.js
│   │   ├── proposals.js
│   │   ├── analytics.js
│   │   ├── activity.js
│   │   ├── export.js
│   │   ├── public.js
│   │   ├── notifications.js
│   │   └── contact.js
│   ├── services/
│   │   ├── consensusService.js          # pure evaluateConsensus() function
│   │   ├── aiSummaryService.js          # Gemini integration, graceful fallback
│   │   └── activityService.js           # fire-and-forget logActivity()
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── socketEvents.js              # typed emit helpers
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── index.js                 # Axios + all API namespaces
        ├── components/
        │   ├── common/
        │   │   ├── SkeletonLoader.jsx
        │   │   ├── Toast.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── cards/
        │   │   ├── TeamCard.jsx
        │   │   └── ProposalCard.jsx
        │   └── layout/
        │       ├── Navbar.jsx
        │       └── Footer.jsx
        ├── context/
        │   ├── AuthContext.jsx           # useCallback-stable login/logout
        │   └── SocketContext.jsx         # room join/leave + user:{id} room
        ├── hooks/
        │   └── useToast.js
        ├── pages/
        │   ├── Analytics.jsx
        │   ├── ActivityTimeline.jsx
        │   ├── ProposalDetails.jsx       # voting + AI summary + export
        │   ├── Dashboard.jsx
        │   ├── TeamBoard.jsx
        │   ├── LandingPage.jsx
        │   ├── Profile.jsx
        │   ├── Notifications.jsx
        │   └── PublicBoard.jsx
        └── utils/
            ├── constants.js
            └── helpers.js
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Google Gemini API key *(optional — AI summaries are skipped gracefully if absent)*

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Team-Dashboard
```

### 2. Install Dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Configure Environment Variables

**`backend/.env`**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-dashboard
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Server

```bash
npm run dev
```

This starts both frontend (`http://localhost:5173`) and backend (`http://localhost:5000`) concurrently.

Or run them separately:

```bash
npm --prefix backend run dev    # backend only (nodemon)
npm --prefix frontend run dev   # frontend only (Vite HMR)
```

### 5. Build for Production

```bash
cd frontend && npm run build    # outputs to frontend/dist/
```

---

## Production Deployment

| Component | Recommended Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway / Render |
| Database | MongoDB Atlas |

After deployment, update `CLIENT_URL` in `backend/.env` and `VITE_API_URL` in `frontend/.env` to match your production URLs.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Socket not connecting | `CLIENT_URL` in `backend/.env` must match the Vite dev port (default 5173) |
| 404 on API calls | `VITE_API_URL` in `frontend/.env` must match the backend port |
| AI summary never appears | Add `GEMINI_API_KEY` to `backend/.env` and check logs for `[AI]` prefix |
| PDF export returns 501 | Run `npm install pdfkit` inside `backend/` |
| Stale Tailwind styles | Delete `frontend/node_modules/.vite` and restart Vite |
| Rate limit 429 errors | Default limits: 120 req/min for API, 20 req/15 min for auth endpoints |
| Vote not saving | Ensure `JWT_SECRET` is set and the `Authorization: Bearer <token>` header is present |

---

## Future Improvements

- Semantic search using vector embeddings
- AI-powered duplicate proposal detection
- Email notifications
- Role-based access control
- Docker and Kubernetes support
- CI/CD pipeline
- End-to-end test coverage
- Mobile application

---

## Authors

- **Guru**
- **Harsh**
- **Gautam**

---

## License

This project is intended for educational and portfolio purposes.