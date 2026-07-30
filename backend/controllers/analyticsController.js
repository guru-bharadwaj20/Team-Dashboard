import Team from '../models/Team.js';
import Proposal from '../models/Proposal.js';
import Activity from '../models/Activity.js';

const TREND_DAYS = 14;

/** UTC day key (YYYY-MM-DD) so bucketing matches the $dateToString grouping. */
const dayKey = (d) => d.toISOString().slice(0, 10);

const filterVotes = (value) => ({
  $filter: { input: '$votes', as: 'v', cond: { $eq: ['$$v.vote', value] } },
});

const round1 = (n) => Math.round(n * 10) / 10;

const emptyPayload = () => ({
  totalTeams: 0,
  totalProposals: 0,
  resolvedProposals: 0,
  openProposals: 0,
  resolutionRate: 0,
  participationRate: 0,
  averageVotes: 0,
  averageComments: 0,
  mostActiveUser: null,
  mostActiveTeam: null,
  votingDistribution: { agree: 0, disagree: 0, neutral: 0 },
  proposalTrend: [],
  recentActivity: [],
});

/**
 * Dashboard analytics, scoped to the teams the caller belongs to.
 *
 * All aggregation happens in MongoDB. The previous implementation loaded every
 * team and every proposal in the database into Node and reduced them in JS, which
 * both exposed other teams' data and scaled with total collection size.
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const teams = await Team.find({ members: userId }).select('_id name members').lean();
    const teamIds = teams.map((t) => t._id);

    if (teamIds.length === 0) return res.json(emptyPayload());

    const since = new Date(Date.now() - (TREND_DAYS - 1) * 86400000);
    since.setUTCHours(0, 0, 0, 0);

    const match = { teamId: { $in: teamIds } };

    const [totalsRows, trendRows, voterRows, topTeamRows, topUserRows, recentActivity] =
      await Promise.all([
        Proposal.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              totalProposals: { $sum: 1 },
              resolvedProposals: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
              openProposals: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
              totalVotes: { $sum: { $size: '$votes' } },
              totalComments: { $sum: { $size: '$comments' } },
              agree: { $sum: { $size: filterVotes('agree') } },
              disagree: { $sum: { $size: filterVotes('disagree') } },
              neutral: { $sum: { $size: filterVotes('neutral') } },
            },
          },
        ]),

        Proposal.aggregate([
          { $match: { ...match, createdAt: { $gte: since } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
        ]),

        // Distinct voters per team, for a per-team participation rate.
        Proposal.aggregate([
          { $match: match },
          { $unwind: '$votes' },
          { $group: { _id: { team: '$teamId', user: '$votes.user' } } },
          { $group: { _id: '$_id.team', voters: { $sum: 1 } } },
        ]),

        Proposal.aggregate([
          { $match: match },
          { $group: { _id: '$teamId', proposalCount: { $sum: 1 } } },
          { $sort: { proposalCount: -1 } },
          { $limit: 1 },
        ]),

        // All-time within the caller's teams, not just the most recent page of
        // activity — the previous version ranked users over only the last 20 rows.
        Activity.aggregate([
          { $match: { teamId: { $in: teamIds }, userId: { $ne: null } } },
          { $group: { _id: '$userId', name: { $last: '$userName' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),

        Activity.find({ teamId: { $in: teamIds } }).sort({ createdAt: -1 }).limit(10).lean(),
      ]);

    const t = totalsRows[0] || {};
    const totalProposals = t.totalProposals || 0;

    // Participation is averaged per team. Summing members across every team and
    // dividing overall distinct voters by that total double-counted anyone who
    // belongs to more than one team, and could exceed 100%.
    const votersByTeam = new Map(voterRows.map((r) => [r._id.toString(), r.voters]));
    const perTeamRates = teams
      .filter((team) => (team.members?.length || 0) > 0)
      .map((team) => (votersByTeam.get(team._id.toString()) || 0) / team.members.length);
    const participationRate = perTeamRates.length
      ? Math.round((perTeamRates.reduce((a, b) => a + b, 0) / perTeamRates.length) * 100)
      : 0;

    const counts = new Map(trendRows.map((r) => [r._id, r.count]));
    const proposalTrend = [];
    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000);
      proposalTrend.push({
        label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        count: counts.get(dayKey(day)) || 0,
      });
    }

    let mostActiveTeam = null;
    if (topTeamRows[0]) {
      const team = teams.find((x) => x._id.equals(topTeamRows[0]._id));
      if (team) mostActiveTeam = { name: team.name, proposalCount: topTeamRows[0].proposalCount };
    }

    const mostActiveUser = topUserRows[0]
      ? { name: topUserRows[0].name, count: topUserRows[0].count }
      : null;

    res.json({
      totalTeams: teams.length,
      totalProposals,
      resolvedProposals: t.resolvedProposals || 0,
      openProposals: t.openProposals || 0,
      // Share of proposals that reached consensus. Previously called
      // "acceptanceRate", which implied approval rather than closure.
      resolutionRate:
        totalProposals > 0 ? Math.round(((t.resolvedProposals || 0) / totalProposals) * 100) : 0,
      participationRate,
      averageVotes: totalProposals > 0 ? round1((t.totalVotes || 0) / totalProposals) : 0,
      averageComments: totalProposals > 0 ? round1((t.totalComments || 0) / totalProposals) : 0,
      mostActiveUser,
      mostActiveTeam,
      votingDistribution: { agree: t.agree || 0, disagree: t.disagree || 0, neutral: t.neutral || 0 },
      proposalTrend,
      recentActivity: recentActivity.map((a) => ({
        id: a._id,
        userId: a.userId,
        userName: a.userName,
        action: a.action,
        targetTitle: a.targetTitle,
        targetType: a.targetType,
        teamId: a.teamId,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
