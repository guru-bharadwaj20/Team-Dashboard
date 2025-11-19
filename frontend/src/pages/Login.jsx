import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isValidEmail } from '../utils/helpers.js';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SUCCESS_MESSAGES } from '../utils/constants.js';
import './Login.css';

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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Handle different error types
      if (err?.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 400) {
        setError('Invalid input. Please check your information.');
      } else if (err?.message === 'Network Error' || !err?.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="auth-form-subtitle">Welcome back! Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
