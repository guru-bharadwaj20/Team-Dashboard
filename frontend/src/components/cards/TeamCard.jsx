import { Link } from 'react-router-dom';

const TeamCard = ({ team, onDelete, onJoin, isMember }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-4 sm:p-5 md:p-6 text-white">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex-1 group-hover:scale-105 transition-transform duration-200 leading-tight">
            {team.name}
          </h3>
          <span className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            {team.memberCount} members
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        {team.description && (
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
            {team.description}
          </p>
        )}

        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Created: {new Date(team.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-5 md:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
        {isMember ? (
          <Link 
            to={`/team/${team.id}`}
            className="flex-1 text-center px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-sm sm:text-base bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 sm:transform sm:hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            View Proposals
          </Link>
        ) : (
          <button
            onClick={() => onJoin(team.id)}
            className="flex-1 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-sm sm:text-base bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 sm:transform sm:hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            Join Team
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(team.id)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-sm sm:text-base bg-danger-100 text-danger-700 font-semibold rounded-lg hover:bg-danger-200 transition-all duration-200"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
