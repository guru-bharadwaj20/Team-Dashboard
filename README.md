# 🧭 Team Decision Board

Full-stack MERN + Socket.io application for creating teams, posting proposals, gathering democratic feedback, real-time updates, notifications, and commenting. Frontend (Vite + React + Tailwind) lives in `/frontend`, backend (Express + MongoDB + Socket.io) in `/backend`.

---

## ✨ Core Features
- Secure JWT authentication (register, login, profile update, password change, account deletion)
- Create & manage teams (real-time team creation & deletion via Socket.io)
- Team boards listing proposals (live updates when proposals are added)
- Create proposals with description, comments, and feedback collection (Agree / Neutral / Disagree)
- Real-time rooms for teams & proposals (joins / leaves handled via socket events)
- Comments on proposals + notification system
- Public read-only board sharing via share link
- Responsive dark UI theme (black / slate / light blue / light red accents) using Tailwind
- Consolidated API layer (`frontend/src/api/index.js`)

---

## 🛠 Tech Stack
**Frontend:** React 19, Vite 7, React Router DOM 7, Tailwind CSS 3, Axios, Socket.io client  
**Backend:** Node.js, Express 4, MongoDB (Mongoose 7), Socket.io 4  
**Auth:** JWT (access token persisted locally)  
**Real-time:** Socket.io rooms for team & proposal events  
**Styling:** Tailwind utility classes + custom gradient theme  
**Tooling:** Nodemon (backend dev), Vite HMR (frontend), Concurrently (root dev script)  

---

## 📦 Monorepo Scripts (root `package.json`)
```bash
# Run both frontend & backend in dev mode
npm run dev

# Start only backend (production style)

```
Frontend scripts (`frontend/package.json`): `npm run dev`, `build`, `preview`, `lint`  
Backend scripts (`backend/package.json`): `npm run dev`, `start`  

---

## 🚀 Installation & Setup
Clone & install:
```bash
git clone <repository-url>
cd Team-Dashboard
npm install
npm --prefix frontend install
npm --prefix backend install
```

Environment variables:
```bash
# backend/.env
PORT=5000
MONGO_URI=<Your MongoDB URI>
JWT_SECRET=<Strong Secret>
CLIENT_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Run development:
```bash
npm run dev
```
Build frontend for production:
```bash
cd frontend
npm run build
```
Serve built frontend separately (example):
```bash
npx serve dist
```

---

## 🔌 API Endpoints Summary
| Domain | Method | Path | Description |
|--------|--------|------|-------------|
| Auth | POST | /api/auth/register | Register a user |
| Auth | POST | /api/auth/login | Login and receive token |
| Auth | PUT | /api/auth/profile | Update profile (protected) |
| Auth | PUT | /api/auth/password | Change password (protected) |
| Auth | DELETE | /api/auth/account | Delete account (protected) |
| Teams | GET | /api/teams | List teams (protected) |
| Teams | POST | /api/teams | Create team (protected) |
| Teams | GET | /api/teams/:id | Get team details |
| Teams | POST | /api/teams/:id | Join team |
| Teams | DELETE | /api/teams/:id | Delete team |
| Teams | GET | /api/teams/:teamId/proposals | List team proposals |
| Teams | POST | /api/teams/:teamId/proposals | Create proposal |
| Proposals | GET | /api/proposals/:id | Get proposal by id |
| Proposals | DELETE | /api/proposals/:id | Delete proposal |
| Proposals | GET | /api/proposals/:id/comments | List comments |
| Proposals | POST | /api/proposals/:id/comments | Add comment |
| Public | GET | /api/public/board/:shareId | Fetch public board |
| Notifications | GET | /api/notifications | List notifications |
| Notifications | PATCH | /api/notifications/:id | Mark read |
| Notifications | DELETE | /api/notifications/:id | Delete single |
| Notifications | DELETE | /api/notifications | Clear all |
| Contact | POST | /api/contact | Submit contact message |
| Contact | GET | /api/contact | List contact messages |
| Contact | GET | /api/contact/:id | Fetch single contact |
| Contact | PUT | /api/contact/:id/status | Update contact status |
| Contact | DELETE | /api/contact/:id | Delete contact |
| Health | GET | /api/health | Service status |

---

## 🧩 Real-time Events (Socket.io)
- `join-team` / `leave-team` — join/leave team rooms
- `join-proposal` / `leave-proposal` — join/leave proposal rooms
- Server currently logs connections; extend with custom events (e.g. proposal created, comment added) as needed.

---

## 🗂 Frontend Folder Structure (Updated)
```bash
frontend/src/
├── api/                 # Axios instance & consolidated API methods
├── components/
│   ├── layout/          # Navbar, Footer
│   ├── cards/           # TeamCard, ProposalCard
│   ├── modals/          # CreateTeamModal, CreateProposalModal
│   ├── common/          # Loader, ProtectedRoute
│   └── index.js         # Component barrel exports
├── context/             # AuthProvider, SocketProvider
├── pages/               # Landing, Dashboard, Login, Register, etc.
├── utils/               # helpers.js, constants.js
├── App.jsx
└── main.jsx
```

## 🗂 Backend Folder Structure
```bash
backend/
├── config/              # db connection
├── controllers/         # route handlers
├── middleware/          # auth + error handling
├── models/              # Mongoose schemas
├── routes/              # Express routers
├── utils/               # helper utilities
├── setup-database.mongodb.js  # seed / setup script
└── server.js            # entry + socket.io server
```

---

## 🔐 Auth Flow
1. User registers or logs in → receives JWT token + user object
2. Token & user persisted via helpers (`helpers.js`) in localStorage
3. Protected routes use `ProtectedRoute` to redirect unauthenticated users
4. Socket connection can be extended to authenticate if needed (currently open with CORS origin restriction)

---

## 🎨 Styling & Design
- Tailwind CSS utilities across all components
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
    - Smaller typography & spacing on mobile for reduced visual stress
    - Gradients: `from-gray-900 via-black to-gray-900` backgrounds + blue / red accents
- Reusable button + card patterns

---

## 🧪 Development Tips
- If white screen appears: check browser console for missing imports (e.g. `Navigate`) or stale Vite cache. Clear by removing `frontend/node_modules/.vite`.
- Socket debug: watch server logs for join/leave events.
- Add new API calls in `frontend/src/api/index.js` following existing async pattern.

---

## 📄 License
Internal / Unspecified. Add a LICENSE file if you plan to open-source.

---

## ✅ Roadmap Ideas
- Add proposal voting aggregation endpoint/results
- Add optimistic UI updates for comments
- Implement role-based access (admin vs member)
- Add rate limiting & security headers
- Add automated tests (Jest + React Testing Library / Supertest)

---

## 🆘 Troubleshooting
| Issue | Fix |
|-------|-----|
| White screen + `Navigate not defined` | Import `Navigate` from `react-router-dom` in `App.jsx` |
| Socket not connecting | Verify `CLIENT_URL` and CORS origin match |
| 404 API responses | Confirm `VITE_API_URL` matches backend port |
| Stale styles | Restart Vite or clear `.vite` cache |

Happy building! 🚀
