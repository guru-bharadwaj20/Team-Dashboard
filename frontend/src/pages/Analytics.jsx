import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { analyticsApi } from '../api/index.js';
import { StatSkeleton } from '../components/common/SkeletonLoader.jsx';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color = 'text-white' }) => (
  <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6 hover:border-primary-600 transition-colors">
    <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">{label}</div>
    <div className={`text-4xl font-extrabold ${color} mb-1`}>{value}</div>
    {sub && <div className="text-sm text-gray-500">{sub}</div>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-bold text-white mb-4">{children}</h2>
);

const VOTE_COLORS = { agree: '#22c55e', neutral: '#facc15', disagree: '#ef4444' };

const ACTIVITY_ICONS = {
  'team.created':       '🏗️',
  'team.deleted':       '🗑️',
  'team.member_joined': '👋',
  'proposal.created':   '📝',
  'proposal.deleted':   '🗑️',
  'proposal.resolved':  '🎯',
  'vote.cast':          '🗳️',
  'vote.changed':       '🔄',
  'comment.added':      '💬',
};

const ACTION_LABELS = {
  'team.created':       'created team',
  'team.deleted':       'deleted team',
  'team.member_joined': 'joined team',
  'proposal.created':   'created proposal',
  'proposal.deleted':   'deleted proposal',
  'proposal.resolved':  'resolved proposal',
  'vote.cast':          'voted on',
  'vote.changed':       'changed vote on',
  'comment.added':      'commented on',
};

const fmtTime = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const res = await analyticsApi.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const voteDist = [
    { name: 'Agree',    value: data.votingDistribution.agree,    fill: VOTE_COLORS.agree },
    { name: 'Neutral',  value: data.votingDistribution.neutral,  fill: VOTE_COLORS.neutral },
    { name: 'Disagree', value: data.votingDistribution.disagree, fill: VOTE_COLORS.disagree },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Platform-wide decision intelligence</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Teams"      value={data.totalTeams}         sub="active workspaces" />
          <StatCard label="Total Proposals"  value={data.totalProposals}     sub="decisions tracked" />
          <StatCard label="Resolved"         value={data.resolvedProposals}  sub="consensus reached" color="text-green-400" />
          <StatCard label="Open"             value={data.openProposals}      sub="awaiting votes"    color="text-blue-400" />
          <StatCard label="Acceptance Rate"  value={`${data.acceptanceRate}%`}  sub="of proposals resolved"  color="text-green-400" />
          <StatCard label="Participation"    value={`${data.participationRate}%`} sub="of members voted"     color="text-yellow-400" />
          <StatCard label="Avg Votes"        value={data.averageVotes}       sub="per proposal" />
          <StatCard label="Avg Comments"     value={data.averageComments}    sub="per proposal" />
        </div>

        {/* Top performers */}
        {(data.mostActiveUser || data.mostActiveTeam) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.mostActiveUser && (
              <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center text-xl font-bold text-white">
                  {data.mostActiveUser.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Most Active Member</div>
                  <div className="text-white font-bold text-lg">{data.mostActiveUser.name}</div>
                  <div className="text-gray-500 text-sm">{data.mostActiveUser.count} actions</div>
                </div>
              </div>
            )}
            {data.mostActiveTeam && (
              <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-xl">🏆</div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Most Active Team</div>
                  <div className="text-white font-bold text-lg">{data.mostActiveTeam.name}</div>
                  <div className="text-gray-500 text-sm">{data.mostActiveTeam.proposalCount} proposals</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposal Trend */}
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6">
            <SectionTitle>Proposal Creation — Last 14 Days</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.proposalTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={1} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="count" name="Proposals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Voting Distribution */}
          <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6">
            <SectionTitle>Voting Distribution</SectionTitle>
            {voteDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={voteDist} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {voteDist.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: '#d1d5db', fontSize: 12 }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No votes yet</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 bg-opacity-70 border border-gray-700 rounded-2xl p-6">
          <SectionTitle>Recent Activity</SectionTitle>
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                    {ACTIVITY_ICONS[a.action] || '•'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium">{a.userName}</span>
                    <span className="text-gray-400"> {ACTION_LABELS[a.action] || a.action} </span>
                    {a.targetTitle && (
                      <span className="text-primary-400 font-medium truncate">"{a.targetTitle}"</span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs flex-shrink-0 pt-0.5">{fmtTime(a.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
