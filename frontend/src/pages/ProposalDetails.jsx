import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { MOCK_PROPOSALS, MOCK_COMMENTS, VOTE_OPTIONS } from '../utils/constants.js';
import { calculateVotePercentages } from '../utils/helpers.js';
import { proposalApi } from '../api/proposalApi.js';
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
        // Real API calls
        const res = await proposalApi.getById(proposalId);
        const data = res?.data ?? res;
        const p = data;
        if (!p) {
          navigate('/error');
          return;
        }

        // Build votes object similar to existing UI expectations
        const counts = p.options.map((opt) => ({ text: opt.text, count: 0 }));
        for (const v of p.votes) {
          const idx = p.options.findIndex((o) => o._id.toString() === v.optionId.toString());
          const useIdx = idx >= 0 ? idx : 0;
          counts[useIdx].count++;
        }

        const votesObj = { yes: 0, no: 0, abstain: 0 };
        if (p.options.length >= 3) {
          for (let i = 0; i < Math.min(3, p.options.length); i++) {
            const txt = (p.options[i].text || '').toLowerCase();
            if (txt.includes('yes')) votesObj.yes += counts[i].count;
            else if (txt.includes('no')) votesObj.no += counts[i].count;
            else if (txt.includes('abstain')) votesObj.abstain += counts[i].count;
            else {
              if (i === 0) votesObj.yes += counts[i].count;
              if (i === 1) votesObj.no += counts[i].count;
              if (i === 2) votesObj.abstain += counts[i].count;
            }
          }
        } else {
          votesObj.yes = counts.reduce((s, c) => s + c.count, 0);
        }

        setProposal({
          id: p._id || p.id,
          title: p.title,
          description: p.description,
          status: p.status || 'open',
          createdAt: p.createdAt,
          deadline: p.deadline,
          votes: votesObj,
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
        setComments(mappedComments.length ? mappedComments : MOCK_COMMENTS.filter((c) => c.proposalId === parseInt(proposalId)));
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
      // option is like 'yes'|'no'|'abstain' in UI; map to option index for backend
      // find index in raw.options by matching text
      const raw = proposal.raw;
      let optionIndex = 0;
      if (raw && raw.options) {
        const idx = raw.options.findIndex((o) => (o.text || '').toLowerCase().includes(option));
        optionIndex = idx >= 0 ? idx : 0;
      }

      await proposalApi.vote(proposalId, optionIndex);
      setUserVote(option);
      setVotedMessage(`Vote recorded: ${option.charAt(0).toUpperCase() + option.slice(1)}`);

      // refresh results
      const res = await proposalApi.results(proposalId);
      const data = res?.data ?? res;
      const results = data.results || [];
      // map back to votes object
      const newVotes = { yes: 0, no: 0, abstain: 0 };
      for (let i = 0; i < results.length; i++) {
        const txt = (results[i].text || '').toLowerCase();
        if (txt.includes('yes')) newVotes.yes += results[i].count;
        else if (txt.includes('no')) newVotes.no += results[i].count;
        else if (txt.includes('abstain')) newVotes.abstain += results[i].count;
        else {
          if (i === 0) newVotes.yes += results[i].count;
          if (i === 1) newVotes.no += results[i].count;
          if (i === 2) newVotes.abstain += results[i].count;
        }
      }
      setProposal({ ...proposal, votes: newVotes });

      setTimeout(() => setVotedMessage(''), 3000);
    } catch {
      alert('Failed to record vote');
    }
  };

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
