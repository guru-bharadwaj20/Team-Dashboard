import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import { publicBoardApi } from '../api/index.js';

const VoteBar = ({ label, count, total, colorClass, textClass }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span className={`font-bold ${textClass}`}>{pct}% ({count})</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const PublicBoard = () => {
  const { shareId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const data = await publicBoardApi.getByShareId(shareId);
        if (!data?.team) { setError('Board not found'); return; }
        setBoard(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [shareId]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">Board Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-semibold">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const { team, proposals } = board;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pb-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-900 bg-opacity-60 border border-primary-700 text-primary-300 text-sm font-semibold mb-4">
            Public Read-Only Board
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">{team.name}</h1>
          {team.description && (
            <p className="text-gray-400 text-lg">{team.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Proposals */}
        {proposals.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-300 text-lg font-semibold">No proposals yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((p) => {
              const total = p.totalVotes;
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{p.title}</h2>
                    <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === 'open' ? 'bg-green-100 text-green-800' :
                      p.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-gray-600 mb-6 leading-relaxed">{p.description}</p>
                  )}

                  {/* Vote Results */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vote Results</h3>
                      <span className="text-sm text-gray-500">{total} vote{total !== 1 ? 's' : ''}</span>
                    </div>
                    <VoteBar label="Agree" count={p.responses.agree} total={total} colorClass="bg-green-500" textClass="text-green-700" />
                    <VoteBar label="Neutral" count={p.responses.neutral} total={total} colorClass="bg-yellow-400" textClass="text-yellow-600" />
                    <VoteBar label="Disagree" count={p.responses.disagree} total={total} colorClass="bg-red-500" textClass="text-red-700" />
                  </div>

                  {/* Options (if any) */}
                  {p.options && p.options.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Proposed Options</h3>
                      <ul className="space-y-1.5">
                        {p.options.map((opt, idx) => (
                          <li key={opt.id || idx} className="flex items-center gap-2 text-gray-700 text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            {opt.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-400">
                    Created {new Date(p.createdAt).toLocaleDateString()}
                    {p.deadline && ` · Deadline ${new Date(p.deadline).toLocaleDateString()}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm transition-colors">
            Powered by Team Decision Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicBoard;
