# 🚀 Setup Guide for Team Decision Board

This guide will help you set up and run the Team Decision Board application for your presentation.

---

## ✅ What's Already Done

Your project is **presentation-ready** with the following complete features:

### Backend (Node.js + Express + MongoDB)
- ✅ User authentication (register/login with JWT)
- ✅ Team management (create, list, view)
- ✅ Proposal system (create, vote, comment)
- ✅ Vote tracking with switchable votes
- ✅ Comment functionality
- ✅ Public shareable boards
- ✅ Protected routes with JWT middleware
- ✅ CORS configured
- ✅ Error handling middleware

### Frontend (React + Vite)
- ✅ Login and Registration pages
- ✅ Dashboard to view/create teams
- ✅ Team boards to view/create proposals
- ✅ Proposal details with voting UI
- ✅ Real-time vote results display
- ✅ Comment system
- ✅ Protected routes
- ✅ Auth context for state management
- ✅ Responsive CSS styling
- ✅ Navbar with dynamic auth state

---

## 📋 What You Need to Add Manually

### 1. Environment Variables (REQUIRED)

#### Backend `.env` file
Create `/backend/.env` with these values:

```bash
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/team-decision-board?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

**How to get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account (if needed)
3. Create a cluster (free tier works)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `team-decision-board`

**Generate JWT_SECRET:**
```bash
# Run in terminal to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend `.env` file
Create `/frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 How to Run

### Step 1: Install Dependencies
From the project root directory:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

### Step 2: Start the Application
From the project root:

```bash
npm run dev
```

This runs both frontend and backend concurrently!

**Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 🎯 Presentation Demo Flow

### 1. **Registration & Login**
- Navigate to http://localhost:5173
- Click "Register" and create an account
- Login with your credentials
- Show how JWT token is stored and navbar updates

### 2. **Create a Team**
- Click "Create Team" button on Dashboard
- Fill in team name and description
- Show the team appears in the list

### 3. **Create a Proposal**
- Click on a team card to view team board
- Click "Create Proposal"
- Enter proposal details
- Show proposal appears in the list

### 4. **Vote on Proposal**
- Click "View Details" on a proposal
- Cast your vote (Yes/No/Abstain)
- Show vote results update immediately
- Switch your vote to demonstrate vote updating

### 5. **Add Comments**
- Scroll to comments section
- Add a comment on the proposal
- Show real-time comment addition

### 6. **Public Board (Optional)**
- Show the team's `shareId` in database
- Access public board: `/board/:shareId`
- Demonstrate read-only view

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if .env exists
ls backend/.env

# Check MongoDB connection
# Make sure MONGO_URI is correct and cluster is accessible
```

### Frontend won't start
```bash
# Check if node_modules exists
ls frontend/node_modules

# Reinstall if needed
cd frontend && npm install
```

### "Cannot connect to backend"
- Ensure backend is running on port 5000
- Check `frontend/.env` has correct API URL
- Check CORS is allowing `http://localhost:5173`

### Database connection errors
- Verify MongoDB Atlas cluster is active
- Check IP whitelist (allow 0.0.0.0/0 for testing)
- Verify database user password is correct

---

## 📊 API Testing (Optional)

Use tools like Postman or curl to test endpoints:

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Create Team (needs token from login)
```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Dev Team","description":"Development decisions"}'
```

---

## 🎨 Features to Highlight in Presentation

1. **Full-Stack Architecture**: MERN stack with proper separation of concerns
2. **Authentication**: Secure JWT-based auth with protected routes
3. **Real-time Updates**: Vote counts and comments update immediately
4. **Collaborative**: Multiple users can vote and comment on proposals
5. **Modular Code**: Clean folder structure (controllers, routes, models, components, pages)
6. **Error Handling**: Proper error messages and loading states
7. **Responsive UI**: Works on different screen sizes
8. **RESTful API**: Well-designed API endpoints
9. **Database Integration**: MongoDB with Mongoose ODM
10. **Shareable**: Public read-only boards via unique URLs

---

## 🚀 Optional Enhancements (If You Have Time)

- Add Tailwind CSS for better styling
- Add loading skeletons
- Add toast notifications
- Add proposal deadlines with visual countdown
- Add user avatars
- Add team member invitation system
- Add email notifications
- Deploy to Vercel (frontend) + Render/Railway (backend)

---

## 📝 Presentation Tips

1. **Start with the problem**: "Teams need a democratic way to make decisions"
2. **Show the solution**: Quick demo of the workflow
3. **Highlight tech stack**: MERN, JWT, REST API
4. **Code walkthrough**: Show 1-2 key files (e.g., auth controller, voting logic)
5. **Challenges faced**: Talk about JWT implementation or vote updating logic
6. **Future improvements**: Mention real-time with Socket.IO, mobile app, etc.

---

## ✨ You're Ready!

Your project has:
- ✅ Complete backend API
- ✅ Full frontend UI
- ✅ Working authentication
- ✅ All CRUD operations
- ✅ Vote and comment systems
- ✅ Clean, modular code
- ✅ Documentation

**Just add the .env files and you're good to present!** 🎉
