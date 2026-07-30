import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/modals/CreateProposalModal.jsx';
import ProposalCard from '../components/cards/ProposalCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { teamApi, proposalApi } from '../api/index.js';
import { useSocket } from '../hooks/useSocket.js';
import { useToastContext } from '../hooks/useToastContext.js';
import { SOCKET_EVENTS } from '../utils/constants.js';

// Normalises a proposal document from the API or a socket payload.
const mapProposal = (p) => ({
  id: p._id || p.id,
  teamId: p.teamId,
  title: p.title,
  description: p.description,
  status: p.status || 'open',
  createdAt: p.createdAt,
  responses: p.responses || { agree: 0, neutral: 0, disagree: 0 },
  totalVotes: p.totalVotes || 0,
});

const TeamBoard = () => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket, connected, joinTeam, leaveTeam } = useSocket();
  const toast = useToastContext();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTeamAndProposals = async () => {
      try {
        const data = await teamApi.getById(teamId);
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
          shareId: foundTeam.shareId,
        });

        setProposals((data.proposals || []).map(mapProposal));
      } catch {
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
      if (data.teamId.toString() !== teamId) return;
      const mapped = mapProposal(data.proposal);
      // The creator is in this room too and has already inserted it locally, so
      // insertion is idempotent on proposal id.
      setProposals((prev) =>
        prev.some((p) => p.id === mapped.id) ? prev : [mapped, ...prev]
      );
    };

    const handleProposalDeleted = (data) => {
      if (data.teamId.toString() === teamId) {
        setProposals((prev) => prev.filter((p) => p.id !== data.proposalId));
      }
    };

    // Emitted when the creator renames the team.
    const handleTeamUpdated = (data) => {
      if (data.teamId !== teamId) return;
      setTeam((prev) => (prev ? { ...prev, name: data.name, description: data.description } : prev));
    };

    // Emitted when the deadline sweeper closes a proposal.
    const handleStatusChanged = (data) => {
      setProposals((prev) =>
        prev.map((p) => (p.id === data.proposalId ? { ...p, status: data.status } : p))
      );
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
    socket.on(SOCKET_EVENTS.TEAM_UPDATED, handleTeamUpdated);
    socket.on(SOCKET_EVENTS.PROPOSAL_STATUS_CHANGED, handleStatusChanged);
    socket.on(SOCKET_EVENTS.PROPOSAL_DELETED, handleProposalDeleted);
    socket.on(SOCKET_EVENTS.TEAM_MEMBER_JOINED, handleMemberJoined);

    return () => {
      socket.off(SOCKET_EVENTS.PROPOSAL_CREATED, handleProposalCreated);
      socket.off(SOCKET_EVENTS.TEAM_UPDATED, handleTeamUpdated);
      socket.off(SOCKET_EVENTS.PROPOSAL_STATUS_CHANGED, handleStatusChanged);
      socket.off(SOCKET_EVENTS.PROPOSAL_DELETED, handleProposalDeleted);
      socket.off(SOCKET_EVENTS.TEAM_MEMBER_JOINED, handleMemberJoined);
      leaveTeam(teamId);
    };
  }, [socket, connected, teamId, joinTeam, leaveTeam]);

  const handleCreateProposal = async (formData) => {
    try {
      // The modal now collects real options and a deadline. The deadline used to
      // be gathered by the form and then silently dropped from this payload.
      const payload = {
        title: formData.title,
        description: formData.description,
        options: formData.options,
        ...(formData.deadline ? { deadline: formData.deadline } : {}),
      };

      const mapped = mapProposal(await proposalApi.create(teamId, payload));
      // Prepended to match the socket path's ordering (newest first), and
      // idempotent because the creator also receives proposal:created.
      setProposals((prev) =>
        prev.some((p) => p.id === mapped.id) ? prev : [mapped, ...prev]
      );
    } catch (err) {
      throw new Error(err.message || 'Failed to create proposal');
    }
  };

  // #106 — there was no way to find anything on a board with more than a screenful.
  const visibleProposals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return proposals.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [proposals, query, statusFilter]);

  const copyShareLink = async () => {
    const url = `${window.location.origin}/board/${team.shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Public board link copied');
    } catch {
      // Clipboard is unavailable over plain HTTP and in some browsers.
      window.prompt('Copy this public board link:', url);
    }
  };

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(team.shareId);
      toast.success('Join code copied');
    } catch {
      window.prompt('Copy this join code:', team.shareId);
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
          <div className="flex flex-wrap items-center gap-2">
            {team.shareId && (
              <>
                <button
                  type="button"
                  onClick={copyJoinCode}
                  className="px-4 py-3 text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold rounded-lg border border-gray-700 transition-colors"
                  title="Members join with this code from their dashboard"
                >
                  Copy join code
                </button>
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-4 py-3 text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold rounded-lg border border-gray-700 transition-colors"
                  title="Read-only public board — anyone with the link can view results"
                >
                  Copy public link
                </button>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              + Create Proposal
            </button>
          </div>
        </div>

        {/* Search and filter */}
        {proposals.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <label htmlFor="proposal-search" className="sr-only">Search proposals</label>
            <input
              id="proposal-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search proposals…"
              className="flex-1 px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="proposal-status" className="sr-only">Filter by status</label>
            <select
              id="proposal-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        )}

        {/* Proposals List or Empty State */}
        {proposals.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
            <p className="text-2xl font-bold text-white mb-2">No proposals yet</p>
            <p className="text-gray-400">
              Create your first proposal to start discussions
            </p>
          </div>
        ) : visibleProposals.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
            <p className="text-xl font-bold text-white mb-2">No matching proposals</p>
            <p className="text-gray-300">Try a different search term or status filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="sr-only" role="status" aria-live="polite">
              {visibleProposals.length} of {proposals.length} proposals shown
            </p>
            {visibleProposals.map((proposal) => (
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
