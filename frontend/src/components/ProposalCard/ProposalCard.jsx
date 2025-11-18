import { Link } from 'react-router-dom';
import './ProposalCard.css';

const ProposalCard = ({ proposal }) => {
  return (
    <div className="proposal-card">
      <div className="proposal-card-header">
        <div>
          <h3 className="proposal-card-title">{proposal.title}</h3>
          <span className={`proposal-card-status ${proposal.status}`}>
            {proposal.status}
          </span>
        </div>
      </div>

      <p className="proposal-card-description">{proposal.description}</p>

      <div className="proposal-card-stats">
        <div className="proposal-card-stat">
          <div className="proposal-card-stat-value">{proposal.votes.yes}</div>
          <div className="proposal-card-stat-label">Yes</div>
        </div>
        <div className="proposal-card-stat">
          <div className="proposal-card-stat-value">{proposal.votes.no}</div>
          <div className="proposal-card-stat-label">No</div>
        </div>
        <div className="proposal-card-stat">
          <div className="proposal-card-stat-value">{proposal.votes.abstain}</div>
          <div className="proposal-card-stat-label">Abstain</div>
        </div>
      </div>

      <div className="proposal-card-footer">
        <span className="proposal-card-date">
          {new Date(proposal.createdAt).toLocaleDateString()}
        </span>
        <Link to={`/proposal/${proposal.id}`} className="proposal-card-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProposalCard;
