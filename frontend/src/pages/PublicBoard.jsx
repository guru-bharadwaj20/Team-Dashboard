import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import { MOCK_PROPOSALS, MOCK_TEAMS } from '../utils/constants.js';
import { calculateResponsePercentages } from '../utils/helpers.js';
import './PublicBoard.css';

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
      <div className="public-board-container">
        <div className="public-board-error">{error}</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="public-board-container">
        <div className="public-board-empty">
          <p className="public-board-empty-text">Board not found</p>
        </div>
      </div>
    );
  }

  const percentages = calculateResponsePercentages(proposal.responses);
  const total =
    proposal.responses.agree + proposal.responses.disagree + proposal.responses.neutral;

  return (
    <div className="public-board-container">
      <div className="public-board-header">
        <h1 className="public-board-title">Feedback Results</h1>
        {team && (
          <p className="public-board-subtitle">Team: {team.name}</p>
        )}
      </div>

      <div className="public-board-card">
        <h2 className="public-board-proposal-title">{proposal.title}</h2>
        <p className="public-board-proposal-description">
          {proposal.description}
        </p>

        <div className="public-board-results">
          <div className="public-result-item">
            <div className="public-result-label">
              <span>Agree</span>
              <span className="public-result-count">{proposal.responses.agree}</span>
            </div>
            <div className="public-result-bar-container">
              <div
                className="public-result-bar agree"
                style={{
                  width: total > 0 ? `${(proposal.responses.agree / total) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="public-result-percentage">
              <span>{percentages.agree}%</span>
              <span>{proposal.responses.agree} responses</span>
            </div>
          </div>

          <div className="public-result-item">
            <div className="public-result-label">
              <span>Disagree</span>
              <span className="public-result-count">{proposal.responses.disagree}</span>
            </div>
            <div className="public-result-bar-container">
              <div
                className="public-result-bar disagree"
                style={{
                  width: total > 0 ? `${(proposal.responses.disagree / total) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="public-result-percentage">
              <span>{percentages.disagree}%</span>
              <span>{proposal.responses.disagree} responses</span>
            </div>
          </div>

          <div className="public-result-item">
            <div className="public-result-label">
              <span>Neutral</span>
              <span className="public-result-count">{proposal.responses.neutral}</span>
            </div>
            <div className="public-result-bar-container">
              <div
                className="public-result-bar neutral"
                style={{
                  width: total > 0 ? `${(proposal.responses.neutral / total) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="public-result-percentage">
              <span>{percentages.neutral}%</span>
              <span>{proposal.responses.neutral} responses</span>
            </div>
          </div>
        </div>

        <div className="public-board-meta">
          <div>
            <strong>Status:</strong>{' '}
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </div>
          <div>
            <strong>Total Responses:</strong> {total}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBoard;
