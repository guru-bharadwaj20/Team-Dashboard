# 🧭 Team Decision Board

Full-stack MERN application (backend in `/backend`, frontend in `/frontend`) for creating teams, posting proposals, gathering feedback, and commenting.

## ✨ Features
- User Authentication (Register/Login)
- Create and manage teams
- Team Boards for organizing proposals
- Add proposals with titles and descriptions
- Comment and discuss proposals within teams
- Public read-only board sharing
- Frontend-Backend integration with Axios

---

## 🛠 Tech Stack
**Frontend:** React (Vite), Axios  
**Backend:** Node.js, Express.js, MongoDB  
**Auth:** JWT  
**Styling:** Custom CSS  

---

## 🚀 Installation & Setup

Clone the repository:
```bash
git clone <repository-url>
```

Install dependencies:
```bash
# From repo root
npm install
npm --prefix frontend install
npm --prefix backend install
```

Configure environment:
```bash
Backend /backend/.env
PORT=5000
MONGO_URI=<Your MongoDB URI>
JWT_SECRET=<Strong Secret>
CLIENT_URL=http://localhost:5173

Frontend /frontend/.env
VITE_API_URL=http://localhost:5000/api
```

Run development servers:
```bash
npm run dev
```

This uses `concurrently` to run the backend (`/backend` dev) and the frontend (`/frontend` dev).

API overview
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Teams: `GET /api/teams`, `POST /api/teams`, `GET /api/teams/:id`, `POST /api/teams/:teamId/proposals`
- Proposals: `GET /api/proposals/:id`, `POST /api/proposals/:id/responses`, `GET /api/proposals/:id/results`, `GET|POST /api/proposals/:id/comments`
- Public board: `GET /api/public/board/:shareId`

Notes
- This scaffold wires the frontend to the backend API endpoints. The frontend still contains some mock data fallbacks for safety when running without a backend.
- Tailwind CSS is not yet configured — the app uses existing CSS files. If you want Tailwind, I can add it and migrate styles.
# Team Decision Board

A collaborative web application for teams to create boards, submit proposals, and gather feedback on decisions democratically. Built with React and Vite.

---

## 🚀 Features

- **Authentication:** Secure Login and Registration pages.
- **Dashboard:** View all your teams and create new ones.
- **Team Boards:** Manage proposals within specific teams.
- **Proposals:** Create proposals with titles and descriptions.
- **Feedback System:** Share feedback "Agree", "Disagree", or "Neutral" and view real-time visual results.
- **Comments:** Discuss proposals before providing feedback.
- **Public View:** Share read-only boards with external users.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Routing:** React Router DOM
- **Styling:** CSS (Black, White, Light Blue theme)
- **HTTP Client:** Axios

---

## 📂 Folder Structure
```bash
root/
│── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── models/
    ├── routes/
    ├── controllers/
    └── server.js
```

---

📝 Usage
1. Register a new account.
2. Create a Team via the Dashboard.
3. Click the team to enter the Team Board.
4. Create a Proposal and share the link with teammates to provide feedback!
