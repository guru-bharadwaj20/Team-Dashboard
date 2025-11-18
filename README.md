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