import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { proposalApi } from '../api/proposalApi.js';
import './ProposalDetails.css';

const ProposalDetails = () => {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

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
          creator: p.creator,
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
    } catch {
      alert('Failed to add comment');
    }
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
          <span className={`proposal-details-status ${proposal.status}`}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </span>
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
            <div className="proposal-details-meta-label">Created By</div>
            <div className="proposal-details-meta-value">
              {proposal.creator?.name || 'Anonymous'}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="comments-section-title">Comments</h2>

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
