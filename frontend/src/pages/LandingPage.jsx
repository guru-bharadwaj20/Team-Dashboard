import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '../utils/helpers.js';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1 className="landing-title">Team Decision Board</h1>
          <p className="landing-subtitle">
            Streamline team decision-making with collaborative feedback and proposal management
          </p>
        </div>

        <div className="landing-buttons">
          <Link to="/login" className="landing-button primary">
            Sign In
          </Link>
          <Link to="/register" className="landing-button secondary">
            Create Account
          </Link>
        </div>

        <div className="landing-features">
          <div className="feature">
            <div className="feature-icon">🗳️</div>
            <h3 className="feature-title">Democratic Voting</h3>
            <p className="feature-description">
              Cast your vote on team proposals with Yes, No, or Abstain options
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Real-time Results</h3>
            <p className="feature-description">
              See feedback results in real-time with interactive progress bars
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">💬</div>
            <h3 className="feature-title">Team Collaboration</h3>
            <p className="feature-description">
              Comment on proposals and engage in meaningful team discussions
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Team Management</h3>
            <p className="feature-description">
              Create and manage multiple teams within your organization
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your team data is secure and only accessible to team members
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">Responsive Design</h3>
            <p className="feature-description">
              Works seamlessly on desktop, tablet, and mobile devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
