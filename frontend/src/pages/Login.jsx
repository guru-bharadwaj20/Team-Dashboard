import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isValidEmail } from '../utils/helpers.js';
import { authApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      // Call backend login via AuthContext helper
      const data = await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.message || (err?.response?.data?.message) || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent px-4">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400 px-4">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-danger-900 bg-opacity-50 border border-danger-500 text-danger-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-200">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-200">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed sm:transform sm:hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Footer Link */}
            <div className="text-center text-sm sm:text-base text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
