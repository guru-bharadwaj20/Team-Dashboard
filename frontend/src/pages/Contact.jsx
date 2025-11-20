import { useState } from 'react';
import contactApi from '../api/contactApi.js';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (formData.message.length < 10) {
      setError('Message must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await contactApi.submitMessage(
        formData.name,
        formData.email,
        formData.subject,
        formData.message
      );

      setSuccess(response.message || 'Thank you! Your message has been sent successfully.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to send message. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>Have a question or suggestion? We'd love to hear from you!</p>
      </div>

      <div className="contact-wrapper">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">💬</div>
            <h3>Quick Response</h3>
            <p>We typically respond within 24 hours</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📧</div>
            <h3>Email Us</h3>
            <p>team@teamdashboard.com</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🌟</div>
            <h3>Your Feedback Matters</h3>
            <p>Help us improve by sharing your thoughts</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Full Name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here (at least 10 characters)..."
              rows="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
