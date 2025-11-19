# Backend (Express + MongoDB)

1. Install dependencies

```bash
cd backend
npm install
```

2. Create `.env` from `.env.example` and set `MONGO_URI`, `JWT_SECRET`, etc.

3. Run in development

```bash
npm run dev
```

API base: `http://localhost:5000/api`
# Team Decision Board — Backend

This folder contains the Express + MongoDB backend for Team Decision Board.

Quick start

1. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development (nodemon):

```bash
npm run dev
```

API base: `/api`

Key endpoints implemented (match frontend expectations):

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login user
- `GET /api/teams` — list teams (protected)
- `POST /api/teams` — create team (protected)
- `GET /api/teams/:id` — get team + proposals (protected)
- `POST /api/teams/:teamId/proposals` — create proposal (protected)
- `GET /api/proposals/:id` — get proposal (protected)
- `POST /api/proposals/:id/votes` — cast/update vote (protected)
- `GET /api/proposals/:id/results` — get vote counts (protected)
- `GET|POST /api/proposals/:id/comments` — comments (protected)
- `GET /api/public/board/:shareId` — public read-only board

Notes

- JWT is expected in `Authorization: Bearer <token>` header. The frontend included in this repo already stores token in `localStorage` and sets header via an axios interceptor.
