import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const authenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Awaited: the server must clear the httpOnly cookie before we navigate away.
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav aria-label="Main" className="bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-2 sm:space-x-3 group"
          >
            <span aria-hidden="true" className="text-xl sm:text-2xl md:text-3xl transform group-hover:scale-110 transition-transform duration-200">🗳️</span>
            <span className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Team Decision Board</span>
              <span className="sm:hidden">TDB</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden text-gray-300 hover:text-white p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {authenticated ? (
              <>
                <Link
                  to="/dashboard"
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  aria-current={isActive('/analytics') ? 'page' : undefined}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/analytics')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/activity"
                  aria-current={isActive('/activity') ? 'page' : undefined}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/activity')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Activity
                </Link>
                <Link
                  to="/notifications"
                  aria-current={isActive('/notifications') ? 'page' : undefined}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/notifications')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden lg:inline">Notifications</span>
                  <span className="lg:hidden">Notif</span>
                </Link>
                <Link
                  to="/profile"
                  aria-current={isActive('/profile') ? 'page' : undefined}
                  className={`px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="ml-1 px-3 lg:px-5 py-2 text-sm bg-danger-600 text-white font-semibold rounded-lg hover:bg-danger-700 transition-all duration-200 shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  aria-current={isActive('/login') ? 'page' : undefined} 
                  className="px-4 lg:px-5 py-2 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  aria-current={isActive('/register') ? 'page' : undefined} 
                  className="px-4 lg:px-5 py-2 text-sm bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-800 transition-all duration-200 shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-3 space-y-2">
            {authenticated ? (
              <>
                <Link
                  to="/dashboard"
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  aria-current={isActive('/analytics') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/analytics')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/activity"
                  aria-current={isActive('/activity') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/activity')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Activity
                </Link>
                <Link
                  to="/notifications"
                  aria-current={isActive('/notifications') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/notifications')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Notifications
                </Link>
                <Link
                  to="/profile"
                  aria-current={isActive('/profile') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/about"
                  aria-current={isActive('/about') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/about')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  aria-current={isActive('/contact') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/contact')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Contact
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm bg-danger-600 text-white font-semibold rounded-lg hover:bg-danger-700 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  aria-current={isActive('/about') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/about')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  aria-current={isActive('/contact') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/contact')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Contact
                </Link>
                <Link 
                  to="/login"
                  aria-current={isActive('/login') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-center bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  aria-current={isActive('/register') ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-center bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
