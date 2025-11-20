import { Link } from 'react-router-dom';

const ProposalCard = ({ proposal }) => {
  const statusStyles = {
    open: 'bg-primary-100 text-primary-800 border-primary-300',
    closed: 'bg-gray-100 text-gray-800 border-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Header */}
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1 group-hover:text-primary-600 transition-colors duration-200">
            {proposal.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[proposal.status] || statusStyles.pending}`}>
            {proposal.status?.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-600 leading-relaxed line-clamp-2">
          {proposal.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(proposal.createdAt).toLocaleDateString()}
        </div>
        <Link 
          to={`/proposal/${proposal.id}`}
          className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md text-sm"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ProposalCard;
