import { Link } from 'react-router-dom';

const statusStyles = {
  open: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const ProposalCard = ({ proposal }) => {
  const total = proposal.totalVotes || 0;
  const responses = proposal.responses || { agree: 0, neutral: 0, disagree: 0 };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 group-hover:text-primary-600 transition-colors">
            {proposal.title}
          </h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyles[proposal.status] || statusStyles.pending}`}>
            {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Open'}
          </span>
        </div>

        {proposal.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{proposal.description}</p>
        )}

        {/* Mini vote bar */}
        {total > 0 && (
          <div className="pt-1">
            <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
              <div className="bg-green-500 h-full" style={{ width: `${(responses.agree / total) * 100}%` }} />
              <div className="bg-yellow-400 h-full" style={{ width: `${(responses.neutral / total) * 100}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${(responses.disagree / total) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{total} vote{total !== 1 ? 's' : ''}</span>
              <span className="text-green-600 font-medium">{Math.round((responses.agree / total) * 100)}% agree</span>
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="text-xs text-gray-400 pt-1">No votes yet</div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {new Date(proposal.createdAt).toLocaleDateString()}
        </span>
        <Link
          to={`/proposal/${proposal.id || proposal._id}`}
          className="px-4 py-1.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          View →
        </Link>
      </div>
    </div>
  );
};

export default ProposalCard;
