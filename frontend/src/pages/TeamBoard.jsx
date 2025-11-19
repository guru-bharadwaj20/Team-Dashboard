import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/CreateProposalModal.jsx';
import ProposalCard from '../components/ProposalCard/ProposalCard.jsx';
import Loader from '../components/Loader.jsx';
import { teamApi } from '../api/teamApi.js';
import { proposalApi } from '../api/proposalApi.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import './TeamBoard.css';

const TeamBoard = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket, connected, joinTeam, leaveTeam } = useSocket();

  useEffect(() => {
    const fetchTeamAndProposals = async () => {
      try {
        // Real API calls
        const res = await teamApi.getById(teamId);
        const data = res?.data ?? res;
        const foundTeam = data.team || data;
        if (!foundTeam) {
          navigate('/error');
          return;
        }
        setTeam({
          id: foundTeam._id || foundTeam.id,
          name: foundTeam.name,
          description: foundTeam.description,
          memberCount: Array.isArray(foundTeam.members) ? foundTeam.members.length : (foundTeam.memberCount || 0),
          createdAt: foundTeam.createdAt,
        });

        const teamProposals = data.proposals || [];
        // Map proposals to UI-friendly shape
        const mapped = teamProposals.map((p) => {
          return {
            id: p._id || p.id,
            teamId: p.teamId,
            title: p.title,
            description: p.description,
            status: p.status || 'open',
            createdAt: p.createdAt,
            raw: p,
          };
        });

        setProposals(mapped);
      } catch (err) {
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndProposals();
  }, [teamId, navigate]);

  // Join team room and listen for real-time updates
  useEffect(() => {
    if (!socket || !connected || !teamId) return;

    // Join the team room
    joinTeam(teamId);

    const handleProposalCreated = (data) => {
      if (data.teamId.toString() === teamId) {
        const p = data.proposal;
        const mapped = {
          id: p._id || p.id,
          teamId: p.teamId,
          title: p.title,
          description: p.description,
          status: p.status || 'open',
          createdAt: p.createdAt,
          raw: p,
        };
        setProposals((prev) => [mapped, ...prev]);
      }
    };

    const handleProposalDeleted = (data) => {
      if (data.teamId.toString() === teamId) {
        setProposals((prev) => prev.filter((p) => p.id !== data.proposalId));
      }
    };

    const handleMemberJoined = (data) => {
      if (data.teamId === teamId) {
        setTeam((prev) => ({
          ...prev,
          memberCount: data.memberCount,
        }));
      }
    };

    socket.on(SOCKET_EVENTS.PROPOSAL_CREATED, handleProposalCreated);
    socket.on(SOCKET_EVENTS.PROPOSAL_DELETED, handleProposalDeleted);
    socket.on(SOCKET_EVENTS.TEAM_MEMBER_JOINED, handleMemberJoined);

    return () => {
      socket.off(SOCKET_EVENTS.PROPOSAL_CREATED, handleProposalCreated);
      socket.off(SOCKET_EVENTS.PROPOSAL_DELETED, handleProposalDeleted);
      socket.off(SOCKET_EVENTS.TEAM_MEMBER_JOINED, handleMemberJoined);
      leaveTeam(teamId);
    };
  }, [socket, connected, teamId, joinTeam, leaveTeam]);

  const handleCreateProposal = async (formData) => {
    try {
      // create proposal via API
      // Ensure options are present: default to Yes/No/Abstain if not provided
      const options = formData.options && Array.isArray(formData.options) && formData.options.length >= 2
        ? formData.options
        : ['Yes', 'No', 'Abstain'];

      const payload = {
        title: formData.title,
        description: formData.description,
        options,
      };

      const res = await proposalApi.create(teamId, payload);
      const created = res?.data ?? res;

      // map to UI shape similar to above
      const mapped = {
        id: created._id || created.id,
        teamId: created.teamId,
        title: created.title,
        description: created.description,
        status: created.status || 'open',
        createdAt: created.createdAt,
        raw: created,
      };
      setProposals([...proposals, mapped]);
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
            Create your first proposal to start discussions
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
