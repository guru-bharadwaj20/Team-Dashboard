import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { MOCK_PROPOSALS, MOCK_COMMENTS, VOTE_OPTIONS } from '../utils/constants.js';
import { calculateVotePercentages } from '../utils/helpers.js';
import './ProposalDetails.css';

const ProposalDetails = () => {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [votedMessage, setVotedMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        // const proposalResponse = await proposals.getById(proposalId);
        // const commentsResponse = await comments.getByProposal(proposalId);

        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundProposal = MOCK_PROPOSALS.find(
          (p) => p.id === parseInt(proposalId)
        );
        if (!foundProposal) {
          navigate('/error');
          return;
        }

        setProposal(foundProposal);

        const proposalComments = MOCK_COMMENTS.filter(
          (c) => c.proposalId === parseInt(proposalId)
        );
        setComments(proposalComments);
      } catch {
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId, navigate]);

  const handleVote = async (option) => {
    try {
      // Mock API call
      // await votes.vote(proposalId, option);

      setUserVote(option);
      setVotedMessage(`Vote recorded: ${option.charAt(0).toUpperCase() + option.slice(1)}`);

      // Update vote count
      const updatedProposal = {
        ...proposal,
        votes: {
          ...proposal.votes,
          [option]: proposal.votes[option] + 1,
        },
      };
      setProposal(updatedProposal);

      setTimeout(() => setVotedMessage(''), 3000);
    } catch {
      alert('Failed to record vote');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      // Mock API call
      // const response = await comments.create(proposalId, commentText);

      const newComment = {
        id: Math.max(...comments.map((c) => c.id), 0) + 1,
        proposalId: parseInt(proposalId),
        author: 'You',
        text: commentText,
        createdAt: new Date().toISOString(),
      };

      setComments([...comments, newComment]);
      setCommentText('');
    } catch {
      alert('Failed to add comment');
    }
  };

  if (loading) return <Loader />;

  if (!proposal) return null;

  const percentages = calculateVotePercentages(proposal.votes);
  const total =
    proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;

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
            <div className="proposal-details-meta-label">Deadline</div>
            <div className="proposal-details-meta-value">
              {proposal.deadline
                ? new Date(proposal.deadline).toLocaleDateString()
                : 'No deadline'}
            </div>
          </div>
          <div className="proposal-details-meta-item">
            <div className="proposal-details-meta-label">Total Votes</div>
            <div className="proposal-details-meta-value">{total}</div>
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="voting-section">
        <h2 className="voting-section-title">Cast Your Vote</h2>

        <div className="voting-options">
          <button
            className={`vote-button yes ${userVote === VOTE_OPTIONS.YES ? 'selected' : ''}`}
            onClick={() => handleVote(VOTE_OPTIONS.YES)}
            disabled={!proposal.status === 'open'}
          >
            ✓ Yes
          </button>
          <button
            className={`vote-button no ${userVote === VOTE_OPTIONS.NO ? 'selected' : ''}`}
            onClick={() => handleVote(VOTE_OPTIONS.NO)}
            disabled={!proposal.status === 'open'}
          >
            ✕ No
          </button>
          <button
            className={`vote-button abstain ${userVote === VOTE_OPTIONS.ABSTAIN ? 'selected' : ''}`}
            onClick={() => handleVote(VOTE_OPTIONS.ABSTAIN)}
            disabled={!proposal.status === 'open'}
          >
            - Abstain
          </button>
        </div>

        {votedMessage && (
          <div className="voting-message success">{votedMessage}</div>
        )}

        {proposal.status !== 'open' && (
          <div className="voting-message info">
            Voting is closed for this proposal
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="results-section">
        <h2 className="results-section-title">Voting Results</h2>

        <div className="results-grid">
          <div className="result-item">
            <div className="result-label">Yes</div>
            <div className="result-bar-container">
              <div
                className="result-bar yes"
                style={{
                  width: total > 0 ? `${(proposal.votes.yes / total) * 100}%` : '0%',
                }}
              >
                {percentages.yes > 5 && `${percentages.yes}%`}
              </div>
            </div>
            <div className="result-percentage">
              <span>{proposal.votes.yes} votes</span>
              <span>{percentages.yes}%</span>
            </div>
          </div>

          <div className="result-item">
            <div className="result-label">No</div>
            <div className="result-bar-container">
              <div
                className="result-bar no"
                style={{
                  width: total > 0 ? `${(proposal.votes.no / total) * 100}%` : '0%',
                }}
              >
                {percentages.no > 5 && `${percentages.no}%`}
              </div>
            </div>
            <div className="result-percentage">
              <span>{proposal.votes.no} votes</span>
              <span>{percentages.no}%</span>
            </div>
          </div>

          <div className="result-item">
            <div className="result-label">Abstain</div>
            <div className="result-bar-container">
              <div
                className="result-bar abstain"
                style={{
                  width: total > 0 ? `${(proposal.votes.abstain / total) * 100}%` : '0%',
                }}
              >
                {percentages.abstain > 5 && `${percentages.abstain}%`}
              </div>
            </div>
            <div className="result-percentage">
              <span>{proposal.votes.abstain} votes</span>
              <span>{percentages.abstain}%</span>
            </div>
          </div>
        </div>
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
