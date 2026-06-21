import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const [teams, proposals, activities] = await Promise.all([
      Team.find().populate('members', '_id'),
      Proposal.find(),
      Activity.find().sort({ createdAt: -1 }).limit(20).populate('userId', 'name'),
    ]);

    const totalTeams = teams.length;
    const totalProposals = proposals.length;
    const resolvedProposals = proposals.filter((p) => p.status === 'resolved').length;
    const openProposals = proposals.filter((p) => p.status === 'open').length;

    // Acceptance rate = resolved / total (0 if no proposals)
    const acceptanceRate = totalProposals > 0 ? Math.round((resolvedProposals / totalProposals) * 100) : 0;

    // Aggregate vote counts
    let totalVotes = 0, agreeVotes = 0, disagreeVotes = 0, neutralVotes = 0;
    let totalComments = 0;
    for (const p of proposals) {
      totalVotes += p.votes.length;
      totalComments += p.comments.length;
      for (const v of p.votes) {
        if (v.vote === 'agree') agreeVotes++;
        else if (v.vote === 'disagree') disagreeVotes++;
        else neutralVotes++;
      }
    }

    const averageVotes = totalProposals > 0 ? parseFloat((totalVotes / totalProposals).toFixed(1)) : 0;
    const averageComments = totalProposals > 0 ? parseFloat((totalComments / totalProposals).toFixed(1)) : 0;

    // Participation rate = voters who voted at least once / total members across all teams
    const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);
    const uniqueVoterIds = new Set(proposals.flatMap((p) => p.votes.map((v) => v.user.toString())));
    const participationRate = totalMembers > 0 ? Math.round((uniqueVoterIds.size / totalMembers) * 100) : 0;

    // Most active user (by activity count)
    const userActivityCount = {};
    for (const a of activities) {
      const uid = a.userId?.toString();
      if (!uid) continue;
      userActivityCount[uid] = userActivityCount[uid] || { name: a.userName, count: 0 };
      userActivityCount[uid].count++;
    }
    const mostActiveUser = Object.values(userActivityCount).sort((a, b) => b.count - a.count)[0] || null;

    // Most active team (by proposal count)
    const teamProposalCount = {};
    for (const p of proposals) {
      const tid = p.teamId.toString();
      teamProposalCount[tid] = (teamProposalCount[tid] || 0) + 1;
    }
    let mostActiveTeam = null;
    const topTeamId = Object.entries(teamProposalCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topTeamId) {
      const t = teams.find((t) => t._id.toString() === topTeamId);
      if (t) mostActiveTeam = { name: t.name, proposalCount: teamProposalCount[topTeamId] };
    }

    // Proposal creation trend: last 14 days
    const now = new Date();
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = proposals.filter((p) => {
        const d = new Date(p.createdAt);
        return d.toDateString() === day.toDateString();
      }).length;
      trend.push({ label, count });
    }

    // Recent activity
    const recentActivity = activities.slice(0, 10).map((a) => ({
      id: a._id,
      userId: a.userId?._id || a.userId,
      userName: a.userName,
      action: a.action,
      targetTitle: a.targetTitle,
      targetType: a.targetType,
      teamId: a.teamId,
      createdAt: a.createdAt,
    }));

    res.json({
      totalTeams,
      totalProposals,
      resolvedProposals,
      openProposals,
      acceptanceRate,
      participationRate,
      averageVotes,
      averageComments,
      mostActiveUser,
      mostActiveTeam,
      votingDistribution: { agree: agreeVotes, disagree: disagreeVotes, neutral: neutralVotes },
      proposalTrend: trend,
      recentActivity,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
