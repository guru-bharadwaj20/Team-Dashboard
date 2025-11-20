import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/modals/CreateProposalModal.jsx';
import ProposalCard from '../components/cards/ProposalCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { teamApi, proposalApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/constants.js';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            ← Back to Teams
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {team.name}
            </h1>
            <p className="mt-2 text-gray-400">{team.description}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            + Create Proposal
          </button>
        </div>

        {/* Proposals List or Empty State */}
        {proposals.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-white mb-2">No proposals yet</p>
            <p className="text-gray-400">
              Create your first proposal to start discussions
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
    </div>
  );
};

export default TeamBoard;
