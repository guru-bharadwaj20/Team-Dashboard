import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '../utils/helpers.js';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent animate-fade-in">
              Team Decision Board
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Streamline team decision-making with collaborative feedback and proposal management
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link 
              to="/login" 
              className="w-64 px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 transform hover:-translate-y-1 transition-all duration-200 shadow-2xl hover:shadow-primary-500/50"
            >
              Sign In →
            </Link>
            <Link 
              to="/register" 
              className="w-64 px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-200 shadow-2xl"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Powerful Features for Your Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">🗳️</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Democratic Voting</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Cast your vote on team proposals with Agree, Disagree, or Neutral options
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">📊</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Real-time Results</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                See feedback results in real-time with interactive progress bars
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">💬</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Team Collaboration</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Comment on proposals and engage in meaningful team discussions
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">👥</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Team Management</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Create and manage multiple teams within your organization
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">🔒</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Secure & Private</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Your team data is secure and only accessible to team members
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-gray-700 hover:border-primary-500 sm:transform sm:hover:-translate-y-2 transition-all duration-300 group">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">📱</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Responsive Design</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Works seamlessly on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
