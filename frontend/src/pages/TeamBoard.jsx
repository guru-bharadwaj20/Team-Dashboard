import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/CreateProposalModal.jsx';
import ProposalCard from '../components/ProposalCard/ProposalCard.jsx';
import Loader from '../components/Loader.jsx';
import { MOCK_TEAMS, MOCK_PROPOSALS } from '../utils/constants.js';
import './TeamBoard.css';

const TeamBoard = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeamAndProposals = async () => {
      try {
        // Simulate API calls
        // const teamResponse = await teams.getById(teamId);
        // const proposalsResponse = await proposals.getByTeamId(teamId);
        
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const foundTeam = MOCK_TEAMS.find((t) => t.id === parseInt(teamId));
        if (!foundTeam) {
          navigate('/error');
          return;
        }
        
        setTeam(foundTeam);
        
        const teamProposals = MOCK_PROPOSALS.filter(
          (p) => p.teamId === parseInt(teamId)
        );
        setProposals(teamProposals);
      } catch (err) {
        console.error(err);
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndProposals();
  }, [teamId, navigate]);

  const handleCreateProposal = async (formData) => {
    try {
      // Mock API call
      // const response = await proposals.create(teamId, formData);
      // setProposals([...proposals, response.data]);
      
      const newProposal = {
        id: Math.max(...proposals.map((p) => p.id), 0) + 1,
        teamId: parseInt(teamId),
        ...formData,
        status: 'open',
        createdAt: new Date().toISOString().split('T')[0],
        votes: { yes: 0, no: 0, abstain: 0 },
      };
      
      setProposals([...proposals, newProposal]);
    } catch {
      throw new Error('Failed to create proposal');
    }
  };

  if (loading) return <Loader />;

  if (!team) return null;

  return (
    <div className="team-board-container">
      <div className="team-board-back">
        <button
          className="team-board-back-link"
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          ← Back to Teams
        </button>
      </div>

      <div className="team-board-header">
        <h1 className="team-board-title">{team.name}</h1>
        <button
          className="team-board-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Create Proposal
        </button>
      </div>

      {proposals.length === 0 ? (
        <div className="team-board-empty">
          <p className="team-board-empty-text">No proposals yet</p>
          <p style={{ color: '#6b7280' }}>
            Create your first proposal to start voting
          </p>
        </div>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}

      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
};

export default TeamBoard;
