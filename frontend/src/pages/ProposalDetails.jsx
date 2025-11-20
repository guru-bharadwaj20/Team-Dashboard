import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import { proposalApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/constants.js';
import { getCurrentUser } from '../utils/helpers.js';

const ProposalDetails = () => {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const { socket, connected, joinProposal, leaveProposal } = useSocket();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Real API calls
        const res = await proposalApi.getById(proposalId);
        const data = res?.data ?? res;
        const p = data;
        if (!p) {
          navigate('/error');
          return;
        }

        setProposal({
          id: p._id || p.id,
          title: p.title,
          description: p.description,
          status: p.status || 'open',
          createdAt: p.createdAt,
          deadline: p.deadline,
          options: p.options || [],
          raw: p,
        });

        // Comments
        const commentsRes = await proposalApi.getComments(proposalId);
        const commentsData = commentsRes?.data ?? commentsRes;
        // map backend comments to UI shape
        const mappedComments = (commentsData || []).map((c) => ({
          id: c._id || `${c.user}-${c.createdAt}`,
          author: c.user?.name || c.user?.email || 'Anonymous',
          text: c.text,
          createdAt: c.createdAt,
        }));
        setComments(mappedComments);
      } catch {
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId, navigate]);

  // Join proposal room and listen for real-time updates
  useEffect(() => {
    if (!socket || !connected || !proposalId) return;

    // Join the proposal room
    joinProposal(proposalId);

    const handleCommentAdded = (data) => {
      if (data.proposalId === proposalId) {
        const newComment = {
          id: data.comment._id,
          author: data.comment.user?.name || 'Anonymous',
          text: data.comment.text,
          createdAt: data.comment.createdAt,
        };
        setComments((prev) => [...prev, newComment]);
      }
    };

    socket.on(SOCKET_EVENTS.COMMENT_ADDED, handleCommentAdded);

    return () => {
      socket.off(SOCKET_EVENTS.COMMENT_ADDED, handleCommentAdded);
      leaveProposal(proposalId);
    };
  }, [socket, connected, proposalId, joinProposal, leaveProposal]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await proposalApi.addComment(proposalId, commentText);
      // refetch comments
      const res = await proposalApi.getComments(proposalId);
      const data = res?.data ?? res;
      const mappedComments = (data || []).map((c) => ({
        id: c._id || `${c.user}-${c.createdAt}`,
        author: c.user?.name || c.user?.email || 'Anonymous',
        text: c.text,
        createdAt: c.createdAt,
      }));
      setComments(mappedComments);
      setCommentText('');
    } catch (err) {
      console.error('Comment error:', err);
      alert(`Failed to add comment: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await proposalApi.delete(proposalId);
        navigate(-1);
      } catch (err) {
        console.error('Delete error:', err);
        alert(`Failed to delete proposal: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    }
  };

  const handleOptionToggle = (optionId) => {
    setSelectedOptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  if (loading) return <Loader />;

  if (!proposal) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        {/* Proposal Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                proposal.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : proposal.status === 'closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-primary-100 text-primary-800'
              }`}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </span>
              {currentUser && proposal.raw?.creator === currentUser.id && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg mb-6">{proposal.description}</p>

          {/* Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Created</div>
              <div className="text-gray-900 font-medium">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500 mb-1">Deadline</div>
              <div className="text-gray-900 font-medium">
                {proposal.deadline
                  ? new Date(proposal.deadline).toLocaleDateString()
                  : 'No deadline'}
              </div>
            </div>
          </div>

          {/* Options */}
          {proposal.options && proposal.options.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Options:</h3>
              <div className="space-y-3">
                {proposal.options.map((option, idx) => (
                  <label
                    key={option._id || idx}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedOptions.has(option._id)
                        ? 'bg-primary-50 border-primary-500'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.has(option._id)}
                      onChange={() => handleOptionToggle(option._id)}
                      className="w-5 h-5 text-primary-600 cursor-pointer"
                    />
                    <span className="text-gray-900 font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

          {/* Comment Form */}
          {proposal.status === 'open' && (
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this proposal..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="4"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Add Comment
              </button>
            </form>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No comments yet</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
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
