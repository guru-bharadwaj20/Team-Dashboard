import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Team Dashboard</h3>
          <p>Making collaborative team decisions simple and effective.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            {/* Add more links as needed */}
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul className="footer-links">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#help">Help Center</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#twitter" title="Twitter">
              <span className="social-icon">𝕏</span>
            </a>
            <a href="#github" title="GitHub">
              <span className="social-icon">⌘</span>
            </a>
            <a href="#linkedin" title="LinkedIn">
              <span className="social-icon">in</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Made with <span className="heart">❤</span> by 
          <strong> Guru</strong>, <strong>Harsh</strong> and <strong>Gautam</strong>
        </p>
        <p>© {currentYear} Team Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
