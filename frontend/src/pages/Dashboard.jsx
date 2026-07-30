import { useState, useEffect } from 'react';
import CreateTeamModal from '../components/modals/CreateTeamModal.jsx';
import TeamCard from '../components/cards/TeamCard.jsx';
import Loader from '../components/common/Loader.jsx';
import { teamApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/constants.js';
import { getCurrentUser } from '../utils/helpers.js';

// Normalises a team document from the API into the shape this page renders.
const mapTeam = (t) => ({
  id: t._id || t.id,
  name: t.name,
  description: t.description,
  memberCount: Array.isArray(t.members) ? t.members.length : (t.memberCount || 0),
  createdAt: t.createdAt || new Date().toISOString(),
  members: t.members || [],
  creator: t.creator?._id || t.creator,
});

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const { socket, connected } = useSocket();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamApi.getAll();
        setTeams((Array.isArray(data) ? data : []).map(mapTeam));
      } catch {
        setError('Failed to load teams');
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Listen for real-time team updates
  useEffect(() => {
    if (!socket || !connected) return;

    const handleTeamCreated = (data) => {
      const newTeam = {
        id: data.team._id || data.team.id,
        name: data.team.name,
        description: data.team.description,
        memberCount: Array.isArray(data.team.members) ? data.team.members.length : 1,
        createdAt: data.team.createdAt || new Date().toISOString(),
      };
      setTeams((prev) => [newTeam, ...prev]);
    };

    const handleTeamDeleted = (data) => {
      setTeams((prev) => prev.filter((t) => t.id !== data.teamId));
    };

    socket.on(SOCKET_EVENTS.TEAM_CREATED, handleTeamCreated);
    socket.on(SOCKET_EVENTS.TEAM_DELETED, handleTeamDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.TEAM_CREATED, handleTeamCreated);
      socket.off(SOCKET_EVENTS.TEAM_DELETED, handleTeamDeleted);
    };
  }, [socket, connected]);

  const handleCreateTeam = async (formData) => {
    try {
      const created = await teamApi.create(formData);
      const newTeam = {
        id: created._id || created.id,
        name: created.name,
        description: created.description,
        memberCount: Array.isArray(created.members) ? created.members.length : 1,
        createdAt: created.createdAt || new Date().toISOString(),
      };
      setTeams([...teams, newTeam]);
    } catch {
      setError('Failed to create team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        // Call backend to delete
        await teamApi.delete(teamId);
        // The socket event will update the UI for all users
        setTeams(teams.filter((t) => t.id !== teamId));
      } catch {
        setError('Failed to delete team');
      }
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    setJoining(true);
    setError('');
    try {
      await teamApi.join(code);
      setJoinCode('');
      const data = await teamApi.getAll();
      setTeams((Array.isArray(data) ? data : []).map(mapTeam));
    } catch (err) {
      setError(err.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-6 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Teams
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <form onSubmit={handleJoinTeam} className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter share code"
                className="flex-1 sm:w-44 px-3 py-2.5 text-sm bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="px-4 py-2.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? 'Joining…' : 'Join'}
              </button>
            </form>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl sm:transform sm:hover:scale-105 transition-all duration-200"
            >
              + Create Team
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-danger-900 bg-opacity-50 border border-danger-500 text-danger-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Teams Grid or Empty State */}
        {teams.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl p-8 sm:p-10 md:p-12 border border-gray-700 text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">👥</div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">No teams yet</p>
            <p className="text-sm sm:text-base text-gray-400">
              Create your first team, or join one with a share code
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={team.creator === currentUser?.id ? handleDeleteTeam : null}
              />
            ))}
          </div>
        )}

        <CreateTeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTeam}
        />
      </div>
    </div>
  );
};

export default Dashboard;
