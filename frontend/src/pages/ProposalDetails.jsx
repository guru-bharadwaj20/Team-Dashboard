import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { proposalApi } from '../api/proposalApi.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getCurrentUser } from '../utils/helpers.js';
import './ProposalDetails.css';

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
    <div className="proposal-details-container">
      <div className="proposal-details-back">
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>

      <div className="proposal-details-card">
        <div className="proposal-details-header">
          <h1 className="proposal-details-title">{proposal.title}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`proposal-details-status ${proposal.status}`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
            {currentUser && proposal.raw?.creator === currentUser.id && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <p className="proposal-details-description">{proposal.description}</p>

        <div className="proposal-details-meta">
          <div className="proposal-details-meta-item">
            <div className="proposal-details-meta-label">Created</div>
            <div className="proposal-details-meta-value">
              {new Date(proposal.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="proposal-details-meta-item">
            <div className="proposal-details-meta-label">Deadline</div>
            <div className="proposal-details-meta-value">
              {proposal.deadline
                ? new Date(proposal.deadline).toLocaleDateString()
                : 'No deadline'}
            </div>
          </div>
        </div>

        {/* Display options if any */}
        {proposal.options && proposal.options.length > 0 && (
          <div className="proposal-options">
            <h3>Options:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {proposal.options.map((option, idx) => (
                <label 
                  key={option._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: selectedOptions.has(option._id) ? '#dbeafe' : '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.has(option._id)}
                    onChange={() => handleOptionToggle(option._id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '1rem', color: '#111827' }}>{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="comments-section-title">Comments</h2>

        {proposal.status === 'open' && (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts on this proposal..."
            />
            <button type="submit" disabled={!commentText.trim()}>
              Add Comment
            </button>
          </form>
        )}

        {comments.length === 0 ? (
          <div className="comments-empty">No comments yet</div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalDetails;
