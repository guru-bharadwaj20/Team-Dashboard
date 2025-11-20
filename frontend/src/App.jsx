import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TeamBoard from './pages/TeamBoard.jsx';
import ProposalDetails from './pages/ProposalDetails.jsx';
import PublicBoard from './pages/PublicBoard.jsx';
import Profile from './pages/Profile.jsx';
import Notifications from './pages/Notifications.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/board/:shareId" element={<PublicBoard />} />

            {/* Private Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/:id"
              element={
                <ProtectedRoute>
                  <TeamBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposal/:id"
              element={
                <ProtectedRoute>
                  <ProposalDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Error and Catch-all Routes */}
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/error" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
