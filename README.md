# Team Decision Board

A real-time collaborative decision-making platform where teams create proposals, vote democratically, and discuss outcomes — all live via WebSocket.

Built by **Guru, Harsh, and Gautam**.

---

## What It Does

Teams often decide by committee email or noisy group chats. This app replaces that with a structured flow:

1. A team member posts a **proposal** with a description and options
2. Every member votes **Agree / Neutral / Disagree** — one vote per person, changeable
3. Live progress bars update for everyone via Socket.io the instant a vote comes in
4. Members discuss in a comment thread on the same page
5. A public share link lets stakeholders view results read-only, no account needed

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM 7, Tailwind CSS 3 |
| State / Auth | React Context + localStorage (JWT) |
| Real-time | Socket.io 4 (WebSocket rooms per team & proposal) |
| HTTP client | Axios (centralized interceptor for auth + error handling) |
| Backend | Node.js, Express 4 (ES modules) |
| Database | MongoDB + Mongoose 7 |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## Features

- **JWT authentication** — register, login, update profile, change password, delete account
- **Team management** — create teams, join teams, share via unique link, delete (creator only)
- **Proposals** — title, description, custom options, optional deadline, open/closed/pending status
- **Real-time voting** — Agree / Neutral / Disagree; users can change their vote; live count via Socket.io
- **Live results** — animated progress bars update the moment any team member votes
- **Comments** — discussion thread per proposal; real-time comment push via socket
- **Notifications** — in-app notifications for new proposals, comments, and team joins
- **Public board** — shareable read-only URL showing all team proposals and vote results (no login needed)
- **Responsive dark UI** — mobile-first Tailwind design with a consistent blue/red accent palette

---

## API Reference

| Domain | Method | Path | Auth |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | — |
| Auth | POST | `/api/auth/login` | — |
| Auth | PUT | `/api/auth/profile` | ✓ |
| Auth | PUT | `/api/auth/password` | ✓ |
| Auth | DELETE | `/api/auth/account` | ✓ |
| Teams | GET | `/api/teams` | ✓ |
| Teams | POST | `/api/teams` | ✓ |
| Teams | GET | `/api/teams/:id` | ✓ |
| Teams | POST | `/api/teams/:id` | ✓ (join) |
| Teams | DELETE | `/api/teams/:id` | ✓ |
| Proposals | GET | `/api/teams/:teamId/proposals` | ✓ |
| Proposals | POST | `/api/teams/:teamId/proposals` | ✓ |
| Proposals | GET | `/api/proposals/:id` | ✓ |
| Proposals | DELETE | `/api/proposals/:id` | ✓ |
| **Voting** | **POST** | **`/api/proposals/:id/vote`** | ✓ |
| Comments | GET | `/api/proposals/:id/comments` | ✓ |
| Comments | POST | `/api/proposals/:id/comments` | ✓ |
| Public | GET | `/api/public/board/:shareId` | — |
| Notifications | GET | `/api/notifications` | ✓ |
| Notifications | PATCH | `/api/notifications/:id` | ✓ (mark read) |
| Notifications | DELETE | `/api/notifications/:id` | ✓ |
| Notifications | DELETE | `/api/notifications` | ✓ (clear all) |
| Contact | POST | `/api/contact` | — |
| Health | GET | `/api/health` | — |

### Vote Endpoint

```
POST /api/proposals/:id/vote
Authorization: Bearer <token>
Body: { "vote": "agree" | "neutral" | "disagree" }

Response: { message, responses: { agree, neutral, disagree }, totalVotes, userVote }
```

A user can re-vote to change their answer. The endpoint always returns the updated counts.

---

## Real-time Events (Socket.io)

| Event | Direction | Payload |
|---|---|---|
| `join-team` / `leave-team` | client → server | teamId |
| `join-proposal` / `leave-proposal` | client → server | proposalId |
| `proposal:created` | server → team room | proposal object |
| `proposal:updated` | server → proposal room | `{ proposalId, responses, totalVotes }` |
| `proposal:deleted` | server → team room | `{ proposalId, teamId }` |
| `comment:added` | server → proposal room | `{ proposalId, comment }` |
| `team:member-joined` | server → team room | member info |
| `notification:new` | server → broadcast | `{ userId, type, title, message, link }` |

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Install

```bash
git clone <repo-url>
cd Team-Dashboard

# Install all dependencies
npm install
npm --prefix frontend install
npm --prefix backend install
```

### Environment Variables

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-dashboard
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### Run (Development)

```bash
npm run dev        # starts both frontend (port 5173) and backend (port 5000) concurrently
```

Or separately:

```bash
npm --prefix backend run dev    # backend only
npm --prefix frontend run dev   # frontend only
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
│   ├── controllers/          # authController, teamController, proposalController, ...
│   ├── middleware/           # authMiddleware (JWT protect), errorHandler
│   ├── models/               # User, Team, Proposal (with votes + status), Notification, Contact
│   ├── routes/               # auth, teams, proposals (+ /vote), public, notifications, contact
│   ├── utils/                # generateToken, socketEvents
│   └── server.js             # Express + Socket.io entry point
└── frontend/src/
    ├── api/index.js           # Axios instance + all API methods (authApi, teamApi, proposalApi, ...)
    ├── components/            # Navbar, Footer, TeamCard, ProposalCard, modals, Loader, ProtectedRoute
    ├── context/               # AuthContext, SocketContext
    ├── pages/                 # LandingPage, Dashboard, TeamBoard, ProposalDetails, Profile, ...
    └── utils/                 # helpers.js, constants.js
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Socket not connecting | Make sure `CLIENT_URL` in `backend/.env` matches the Vite port (default 5173) |
| 404 on API calls | Check `VITE_API_URL` in `frontend/.env` matches backend port |
| Vote not saving | Ensure `JWT_SECRET` is set and token is being sent in the `Authorization` header |
| Stale Tailwind styles | Delete `frontend/node_modules/.vite` and restart Vite |
