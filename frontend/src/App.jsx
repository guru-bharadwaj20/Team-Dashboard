import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Loader from './components/common/Loader.jsx';

// Route-level code splitting. Every page used to be in the entry bundle, so a
// visitor on the landing page downloaded the analytics dashboard and Recharts
// before seeing anything. Navbar, Footer and Loader stay eager — they render on
// the first paint of every route.
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const TeamBoard = lazy(() => import('./pages/TeamBoard.jsx'));
const ProposalDetails = lazy(() => import('./pages/ProposalDetails.jsx'));
const PublicBoard = lazy(() => import('./pages/PublicBoard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const ActivityTimeline = lazy(() => import('./pages/ActivityTimeline.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const ErrorPage = lazy(() => import('./pages/ErrorPage.jsx'));

const protectedRoute = (Component) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Visible only on keyboard focus: lets a keyboard or screen-reader user
            jump past the nav, which is repeated on every route. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary-600 focus:text-white focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/board/:shareId" element={<PublicBoard />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={protectedRoute(Dashboard)} />
              <Route path="/team/:id" element={protectedRoute(TeamBoard)} />
              <Route path="/proposal/:id" element={protectedRoute(ProposalDetails)} />
              <Route path="/profile" element={protectedRoute(Profile)} />
              <Route path="/notifications" element={protectedRoute(Notifications)} />
              <Route path="/analytics" element={protectedRoute(Analytics)} />
              <Route path="/activity" element={protectedRoute(ActivityTimeline)} />

              {/* Error and Catch-all Routes */}
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<Navigate to="/error" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
