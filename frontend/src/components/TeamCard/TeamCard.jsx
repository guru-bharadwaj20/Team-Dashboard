import { Link } from 'react-router-dom';
import './TeamCard.css';

const TeamCard = ({ team, onDelete, onJoin, isMember }) => {
  return (
    <div className="team-card">
      <div className="team-card-header">
        <h3 className="team-card-title">{team.name}</h3>
        <span className="team-card-badge">{team.memberCount} members</span>
      </div>

      {team.description && (
        <p className="team-card-description">{team.description}</p>
      )}

      <div className="team-card-info">
        <div className="team-card-info-item">
          <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="team-card-actions">
        {isMember ? (
          <Link to={`/team/${team.id}`} className="team-card-button">
            View Proposals
          </Link>
        ) : (
          <button
            className="team-card-button"
            onClick={() => onJoin(team.id)}
          >
            Join Team
          </button>
        )}
        {onDelete && (
          <button
            className="team-card-button secondary"
            onClick={() => onDelete(team.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
