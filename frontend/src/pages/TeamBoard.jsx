import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/CreateProposalModal.jsx';
import ProposalCard from '../components/ProposalCard/ProposalCard.jsx';
import Loader from '../components/Loader.jsx';
import { MOCK_TEAMS, MOCK_PROPOSALS } from '../utils/constants.js';
import { teamApi } from '../api/teamApi.js';
import { proposalApi } from '../api/proposalApi.js';
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
          // count votes per option
          const counts = p.options.map((opt) => ({ text: opt.text, count: 0 }));
          for (const v of p.votes) {
            const idx = counts.findIndex((c) => c.text && (v.optionId.toString() === p.options[counts.indexOf(c)]?._id?.toString()));
            // fallback: try matching by optionId
            const byIdIdx = p.options.findIndex((o) => o._id.toString() === v.optionId.toString());
            const useIdx = byIdIdx >= 0 ? byIdIdx : idx >= 0 ? idx : 0;
            counts[useIdx].count++;
          }

          // Map counts into yes/no/abstain if possible
          const votesObj = { yes: 0, no: 0, abstain: 0 };
          if (p.options.length >= 3) {
            // attempt to map by text
            for (let i = 0; i < Math.min(3, p.options.length); i++) {
              const txt = (p.options[i].text || '').toLowerCase();
              if (txt.includes('yes')) votesObj.yes += counts[i].count;
              else if (txt.includes('no')) votesObj.no += counts[i].count;
              else if (txt.includes('abstain')) votesObj.abstain += counts[i].count;
              else {
                // fallback: distribute into yes/no/abstain by index
                if (i === 0) votesObj.yes += counts[i].count;
                if (i === 1) votesObj.no += counts[i].count;
                if (i === 2) votesObj.abstain += counts[i].count;
              }
            }
          } else {
            // fewer than 3 options: lump into yes
            votesObj.yes = counts.reduce((s, c) => s + c.count, 0);
          }

          return {
            id: p._id || p.id,
            teamId: p.teamId,
            title: p.title,
            description: p.description,
            status: p.status || 'open',
            createdAt: p.createdAt,
            votes: votesObj,
            raw: p,
          };
        });

        setProposals(mapped.length ? mapped : MOCK_PROPOSALS.filter((p) => p.teamId === parseInt(teamId)));
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
        votes: { yes: 0, no: 0, abstain: 0 },
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
