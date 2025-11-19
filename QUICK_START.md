# 📋 QUICK START - Team Decision Board

## Manual Steps Required (5 minutes)

### 1. Backend Environment Variables
Create `backend/.env`:
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/team-decision-board
JWT_SECRET=run_this_command_to_generate_secret
CLIENT_URL=http://localhost:5173
```

**Get MongoDB URI:** https://www.mongodb.com/cloud/atlas (free tier)
**Generate JWT_SECRET:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 2. Frontend Environment Variables
Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Install & Run
```bash
npm install
npm --prefix frontend install
npm --prefix backend install
npm run dev
```

### 4. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api

---

## ✅ What's Already Complete

### Backend Features
- User registration & login (JWT auth)
- Team CRUD operations
- Proposal CRUD with voting
- Comment system
- Public shareable boards
- Protected routes
- CORS configured

### Frontend Features
- Login/Register pages
- Dashboard (view/create teams)
- Team boards (view/create proposals)
- Voting interface (Yes/No/Abstain)
- Comment system
- Protected routes
- Auth state management
- Responsive UI

### API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - View team
- `POST /api/teams/:teamId/proposals` - Create proposal
- `GET /api/proposals/:id` - View proposal
- `POST /api/proposals/:id/votes` - Cast vote
- `POST /api/proposals/:id/comments` - Add comment
- `GET /api/public/board/:shareId` - Public board view

---

## 🎯 Demo Flow (5 minutes)

1. **Register** → Create account
2. **Create Team** → "Product Team"
3. **Create Proposal** → "Should we use React?"
4. **Vote** → Click "Yes" 
5. **Comment** → Add feedback
6. **Show Results** → Vote percentages update

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check `.env` exists and MONGO_URI is correct |
| Frontend can't connect | Ensure backend is running on port 5000 |
| Database error | Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0) |
| Login fails | Check JWT_SECRET is set in backend/.env |

---

## 🎨 Presentation Highlights

- **Full MERN Stack** - MongoDB, Express, React, Node.js
- **Secure Auth** - JWT tokens, password hashing with bcrypt
- **RESTful API** - Clean endpoint structure
- **Real-time Updates** - Vote counts update immediately
- **Modular Code** - Controllers, routes, models, components
- **Production Ready** - Error handling, validation, CORS

---

## That's It! 🚀

Just create the 2 `.env` files and run `npm run dev`!
