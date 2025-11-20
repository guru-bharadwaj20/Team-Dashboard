import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="text-center space-y-8">
        <div className="text-9xl font-bold bg-gradient-to-r from-danger-500 to-primary-500 bg-clip-text text-transparent animate-pulse">
          404
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-400 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            Go to Home
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
