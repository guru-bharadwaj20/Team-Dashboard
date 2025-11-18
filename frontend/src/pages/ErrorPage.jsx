import './ErrorPage.css';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="error-actions">
          <button className="error-button primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
          <button className="error-button secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
