import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white border-t border-gray-800">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Team Dashboard
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Making collaborative team decisions simple and effective.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base sm:text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-base sm:text-lg font-semibold text-white">Resources</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a href="#privacy" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#help" className="text-gray-400 text-xs sm:text-sm hover:text-primary-400 transition-colors duration-200">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h4 className="text-base sm:text-lg font-semibold text-white">Follow Us</h4>
            <div className="flex space-x-3">
              <a 
                href="#twitter" 
                title="Twitter"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-all duration-200 transform hover:-translate-y-1"
              >
                <span className="text-base sm:text-xl">𝕏</span>
              </a>
              <a 
                href="#github" 
                title="GitHub"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-all duration-200 transform hover:-translate-y-1"
              >
                <span className="text-base sm:text-xl">⌘</span>
              </a>
              <a 
                href="#linkedin" 
                title="LinkedIn"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-primary-600 transition-all duration-200 transform hover:-translate-y-1"
              >
                <span className="text-base sm:text-xl font-bold">in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-center sm:text-left">
            <p className="text-gray-400 text-xs sm:text-sm">
              Made with <span className="text-danger-500 animate-pulse">❤</span> by 
              <strong className="text-primary-400"> Guru</strong>, 
              <strong className="text-primary-400"> Harsh</strong> and 
              <strong className="text-primary-400"> Gautam</strong>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              © {currentYear} Team Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
