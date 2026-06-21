import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import { proposalApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/constants.js';
import { getCurrentUser } from '../utils/helpers.js';

const VOTE_OPTIONS = [
  { key: 'agree', label: 'Agree', color: 'green', bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', light: 'bg-green-50', icon: '✓' },
  { key: 'neutral', label: 'Neutral', color: 'yellow', bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50', icon: '–' },
  { key: 'disagree', label: 'Disagree', color: 'red', bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-700', light: 'bg-red-50', icon: '✕' },
];

const VoteBar = ({ label, count, total, colorClass }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span>{count} vote{count !== 1 ? 's' : ''} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ProposalDetails = () => {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [responses, setResponses] = useState({ agree: 0, disagree: 0, neutral: 0 });
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { socket, connected, joinProposal, leaveProposal } = useSocket();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await proposalApi.getById(proposalId);
        if (!data) { navigate('/error'); return; }

        setProposal({
          id: data._id,
          title: data.title,
          description: data.description,
          status: data.status || 'open',
          createdAt: data.createdAt,
          deadline: data.deadline,
          options: data.options || [],
          creatorId: data.creator?._id || data.creator,
        });
        setResponses(data.responses || { agree: 0, disagree: 0, neutral: 0 });
        setTotalVotes(data.totalVotes || 0);
        setUserVote(data.userVote || null);

        const commentsData = await proposalApi.getComments(proposalId);
        setComments(
          (commentsData || []).map((c) => ({
            id: c._id,
            author: c.user?.name || c.user?.email || 'Anonymous',
            text: c.text,
            createdAt: c.createdAt,
          }))
        );
      } catch {
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId, navigate]);

  // Real-time: join proposal room and listen for updates
  useEffect(() => {
    if (!socket || !connected || !proposalId) return;
    joinProposal(proposalId);

    const handleCommentAdded = (data) => {
      if (data.proposalId === proposalId) {
        setComments((prev) => [
          ...prev,
          {
            id: data.comment._id,
            author: data.comment.user?.name || 'Anonymous',
            text: data.comment.text,
            createdAt: data.comment.createdAt,
          },
        ]);
      }
    };

    const handleVoteUpdate = (data) => {
      if (data.proposalId === proposalId) {
        setResponses(data.responses);
        setTotalVotes(data.totalVotes);
      }
    };

    socket.on(SOCKET_EVENTS.COMMENT_ADDED, handleCommentAdded);
    socket.on(SOCKET_EVENTS.PROPOSAL_UPDATED, handleVoteUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.COMMENT_ADDED, handleCommentAdded);
      socket.off(SOCKET_EVENTS.PROPOSAL_UPDATED, handleVoteUpdate);
      leaveProposal(proposalId);
    };
  }, [socket, connected, proposalId, joinProposal, leaveProposal]);

  const handleVote = async (vote) => {
    if (voting || proposal?.status !== 'open') return;
    setVoting(true);
    try {
      const res = await proposalApi.vote(proposalId, vote);
      setResponses(res.responses);
      setTotalVotes(res.totalVotes);
      setUserVote(res.userVote);
    } catch (err) {
      alert(`Vote failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setVoting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await proposalApi.addComment(proposalId, commentText);
      const commentsData = await proposalApi.getComments(proposalId);
      setComments(
        (commentsData || []).map((c) => ({
          id: c._id,
          author: c.user?.name || c.user?.email || 'Anonymous',
          text: c.text,
          createdAt: c.createdAt,
        }))
      );
      setCommentText('');
    } catch (err) {
      alert(`Failed to add comment: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this proposal?')) return;
    try {
      await proposalApi.delete(proposalId);
      navigate(-1);
    } catch (err) {
      alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <Loader />;
  if (!proposal) return null;

  const isOpen = proposal.status === 'open';
  const isCreator = currentUser && proposal.creatorId === currentUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors flex items-center gap-2"
        >
          ← Back
        </button>

        {/* Proposal Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                proposal.status === 'open' ? 'bg-green-100 text-green-800' :
                proposal.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
              {isCreator && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">{proposal.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created</div>
              <div className="text-gray-900 font-medium">{new Date(proposal.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deadline</div>
              <div className="text-gray-900 font-medium">
                {proposal.deadline ? new Date(proposal.deadline).toLocaleDateString() : 'No deadline'}
              </div>
            </div>
          </div>

          {/* Options (informational) */}
          {proposal.options.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Proposed Options</h3>
              <ul className="space-y-2">
                {proposal.options.map((opt, idx) => (
                  <li key={opt._id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-800">{opt.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Voting */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cast Your Vote</h3>
              <span className="text-sm text-gray-500">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} total</span>
            </div>

            {isOpen ? (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {VOTE_OPTIONS.map(({ key, label, bg, border, text, light, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleVote(key)}
                    disabled={voting}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      userVote === key
                        ? `${light} ${border} ${text} shadow-md scale-105`
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white ${userVote === key ? bg : 'bg-gray-300'}`}>
                      {icon}
                    </span>
                    {label}
                    {userVote === key && <span className="text-xs ml-1">(your vote)</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-gray-500 text-sm text-center">
                This proposal is {proposal.status} — voting is no longer available.
              </div>
            )}

            {/* Live Results */}
            <div className="space-y-3">
              <VoteBar label="Agree" count={responses.agree} total={totalVotes} colorClass="bg-green-500" />
              <VoteBar label="Neutral" count={responses.neutral} total={totalVotes} colorClass="bg-yellow-400" />
              <VoteBar label="Disagree" count={responses.disagree} total={totalVotes} colorClass="bg-red-500" />
            </div>

            {totalVotes > 0 && (
              <p className="mt-3 text-xs text-gray-400 text-center">
                {(() => {
                  const lead = Object.entries(responses).reduce((a, b) => (b[1] > a[1] ? b : a));
                  const pct = Math.round((lead[1] / totalVotes) * 100);
                  return `Leading: ${lead[0].charAt(0).toUpperCase() + lead[0].slice(1)} at ${pct}%`;
                })()}
              </p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Discussion ({comments.length})</h2>

          {isOpen && (
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this proposal..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                rows="3"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="mt-3 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No comments yet — start the discussion!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-gray-900">{c.author}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;
