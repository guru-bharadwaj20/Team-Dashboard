import { useState } from 'react';
import { contactApi } from '../api/index.js';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-xl">
            Have a question or suggestion? We'd love to hear from you!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 p-6 text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Quick Response</h3>
              <p className="text-gray-600">We typically respond within 24 hours</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 p-6 text-center">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Email Us</h3>
              <p className="text-gray-600">team@teamdashboard.com</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Your Feedback Matters</h3>
              <p className="text-gray-600">Help us improve by sharing your thoughts</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger-100 border border-danger-400 text-danger-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here (at least 10 characters)..."
                  rows="6"
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
