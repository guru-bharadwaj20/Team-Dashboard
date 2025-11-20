import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isValidEmail, isValidPassword } from '../utils/helpers.js';
import { authApi } from '../api/index.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.registerOnly(formData.name, formData.email, formData.password);
      setSuccess('Registration completed successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err?.message || (err?.response?.data?.message) || 'Registration failed. Please try again.';
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
            Create Account
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400 px-4">
            Join us to start making team decisions
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

            {success && (
              <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-200">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

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

            {/* Confirm Password Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-200">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl sm:transform sm:hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Footer */}
            <div className="text-center text-sm sm:text-base text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
