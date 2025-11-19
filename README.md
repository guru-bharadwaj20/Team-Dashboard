# Team Decision Board

Full-stack MERN application (backend in `/backend`, frontend in `/frontend`) for creating teams, posting proposals, voting, and commenting.

Quick start (local):

1. Install dependencies

```bash
# from repo root
npm install
npm --prefix frontend install
npm --prefix backend install
```

2. Create env files

Copy `.env.example` in `/backend` and fill values. Also copy `/frontend/.env.example` to `/frontend/.env` if needed.

Backend `/backend/.env`:

```
PORT=5000
MONGO_URI=<Your MongoDB Atlas URI>
JWT_SECRET=<A_Strong_Secret>
CLIENT_URL=http://localhost:5173
```

Frontend `/frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

3. Run both servers (from repo root):

```bash
npm run dev
```

This uses `concurrently` to run the backend (`/backend` dev) and the frontend (`/frontend` dev).

API overview
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Teams: `GET /api/teams`, `POST /api/teams`, `GET /api/teams/:id`, `POST /api/teams/:teamId/proposals`
- Proposals: `GET /api/proposals/:id`, `POST /api/proposals/:id/votes`, `GET /api/proposals/:id/results`, `GET|POST /api/proposals/:id/comments`
- Public board: `GET /api/public/board/:shareId`

Notes
- This scaffold wires the frontend to the backend API endpoints. The frontend still contains some mock data fallbacks for safety when running without a backend.
- Tailwind CSS is not yet configured — the app uses existing CSS files. If you want Tailwind, I can add it and migrate styles.
# Team Decision Board

A collaborative web application for teams to create boards, submit proposals, and vote on decisions democratically. Built with React and Vite.

---

## 🚀 Features

- **Authentication:** Secure Login and Registration pages.
- **Dashboard:** View all your teams and create new ones.
- **Team Boards:** Manage proposals within specific teams.
- **Proposals:** Create proposals with titles and descriptions.
- **Voting System:** Vote "Yes", "No", or "Abstain" and view real-time visual results.
- **Comments:** Discuss proposals before voting.
- **Public View:** Share read-only boards with external users.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Routing:** React Router DOM
- **Styling:** CSS (Black, White, Light Blue theme)
- **HTTP Client:** Axios

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Team-Dashboard/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open in browser: Visit http://localhost

---

## 📂 Project Structure

src/
├── components/      # Reusable UI components (Navbar, Cards, Modals)
├── pages/           # Main Application Screens (Login, Dashboard, etc.)
├── utils/           # Helper functions and API configuration
├── App.jsx          # Main Routing Logic
└── main.jsx         # Entry point

---

📝 Usage
1. Register a new account.
2. Create a Team via the Dashboard.
3. Click the team to enter the Team Board.
4. Create a Proposal and share the link with teammates to vote!