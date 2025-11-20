import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import { MOCK_PROPOSALS, MOCK_TEAMS } from '../utils/constants.js';
import { calculateResponsePercentages } from '../utils/helpers.js';

const PublicBoard = () => {
  const { shareId } = useParams();
  const [proposal, setProposal] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Simulate API call
        // const response = await publicBoard.getByShareId(shareId);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // For demo, treat shareId as proposalId
        const foundProposal = MOCK_PROPOSALS.find(
          (p) => p.id === parseInt(shareId)
        );

        if (!foundProposal) {
          setError('Board not found');
          return;
        }

        setProposal(foundProposal);

        const foundTeam = MOCK_TEAMS.find((t) => t.id === foundProposal.teamId);
        setTeam(foundTeam);
      } catch {
        setError('Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [shareId]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-danger-50 border border-danger-300 rounded-2xl p-6 text-center">
            <p className="text-danger-700 text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <p className="text-gray-700 text-lg font-semibold">Board not found</p>
          </div>
        </div>
      </div>
    );
  }

  const percentages = calculateResponsePercentages(proposal.responses);
  const total =
    proposal.responses.agree + proposal.responses.disagree + proposal.responses.neutral;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Feedback Results</h1>
          {team && (
            <p className="text-xl text-blue-400 font-medium">Team: {team.name}</p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Proposal Details */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">{proposal.title}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {proposal.description}
            </p>
          </div>

          {/* Results Section */}
          <div className="space-y-6 mt-8">
            {/* Agree Result */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Agree</span>
                <span className="text-lg font-bold text-blue-600">{proposal.responses.agree}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: total > 0 ? `${(proposal.responses.agree / total) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-blue-600">{percentages.agree}%</span>
                <span className="text-gray-600">{proposal.responses.agree} responses</span>
              </div>
            </div>

            {/* Disagree Result */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Disagree</span>
                <span className="text-lg font-bold text-red-600">{proposal.responses.disagree}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-red-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: total > 0 ? `${(proposal.responses.disagree / total) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-red-600">{percentages.disagree}%</span>
                <span className="text-gray-600">{proposal.responses.disagree} responses</span>
              </div>
            </div>

            {/* Neutral Result */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Neutral</span>
                <span className="text-lg font-bold text-gray-600">{proposal.responses.neutral}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gray-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: total > 0 ? `${(proposal.responses.neutral / total) * 100}%` : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-600">{percentages.neutral}%</span>
                <span className="text-gray-600">{proposal.responses.neutral} responses</span>
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <strong className="font-semibold">Status:</strong>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === 'active' 
                  ? 'bg-blue-100 text-blue-700' 
                  : proposal.status === 'closed'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <strong className="font-semibold">Total Responses:</strong>
              <span className="text-lg font-bold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBoard;
