import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    removeAuthToken();
    removeCurrentUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🗳️ Team Decision Board
        </Link>

        <div className="navbar-menu">
          {authenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/notifications"
                className={`navbar-link ${isActive('/notifications') ? 'active' : ''}`}
              >
                Notifications
              </Link>
              <Link
                to="/profile"
                className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
              <button className="navbar-button logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-button">
                Login
              </Link>
              <Link to="/register" className="navbar-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
