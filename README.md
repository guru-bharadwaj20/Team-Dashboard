# 🧭 Team Decision Board

A full-stack MERN application that enables teams to collaborate by creating boards, submitting proposals, sharing ideas, and discussing them in real time.

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
- Frontend runs at http://localhost:5173
- Backend runs at http://localhost:5000

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

## 📝 Usage
1. Register a new account
2. Create a team from the dashboard
3. Open a team to view its board
4. Create proposals and start discussions
5. Share public links for read-only access
