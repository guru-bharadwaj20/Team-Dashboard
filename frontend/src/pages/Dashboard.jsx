import { useState, useEffect } from 'react';
import CreateTeamModal from '../components/CreateTeamModal.jsx';
import TeamCard from '../components/TeamCard/TeamCard.jsx';
import Loader from '../components/Loader.jsx';
import { MOCK_TEAMS } from '../utils/constants.js';
import { teamApi } from '../api/teamApi.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getCurrentUser } from '../utils/helpers.js';
import './Dashboard.css';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const { socket, connected } = useSocket();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Real API call
        const res = await teamApi.getAll();
        const data = res?.data ?? res;
        // Map backend teams to UI shape
        const mapped = (data || []).map((t) => ({
          id: t._id || t.id,
          name: t.name,
          description: t.description,
          memberCount: Array.isArray(t.members) ? t.members.length : (t.memberCount || 0),
          createdAt: t.createdAt || new Date().toISOString(),
          members: t.members || [],
          creator: t.creator?._id || t.creator,
        }));
        setTeams(mapped);
      } catch (err) {
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
      // Call backend to create
      const res = await teamApi.create(formData);
      const created = res?.data ?? res;
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

  const handleJoinTeam = async (teamId) => {
    try {
      await teamApi.join(teamId);
      // Refresh teams to get updated member count
      const res = await teamApi.getAll();
      const data = res?.data ?? res;
      const mapped = (data || []).map((t) => ({
        id: t._id || t.id,
        name: t.name,
        description: t.description,
        memberCount: Array.isArray(t.members) ? t.members.length : (t.memberCount || 0),
        createdAt: t.createdAt || new Date().toISOString(),
        members: t.members || [],
        creator: t.creator?._id || t.creator,
      }));
      setTeams(mapped);
    } catch (err) {
      setError('Failed to join team');
    }
  };

  const isUserMember = (team) => {
    if (!currentUser) return false;
    return team.members.some(m => {
      const memberId = typeof m === 'object' ? m._id : m;
      return memberId === currentUser.id;
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Teams</h1>
        <button
          className="dashboard-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Create Team
        </button>
      </div>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">👥</div>
          <p className="dashboard-empty-text">No teams yet</p>
          <p style={{ color: '#6b7280' }}>
            Create your first team to get started
          </p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onDelete={team.creator === currentUser?.id ? handleDeleteTeam : null}
              onJoin={handleJoinTeam}
              isMember={isUserMember(team)}
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
  );
};

export default Dashboard;
