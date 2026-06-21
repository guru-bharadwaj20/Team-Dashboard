import Activity from '../models/Activity.js';

const ACTION_LABELS = {
  'team.created': 'created team',
  'team.deleted': 'deleted team',
  'team.member_joined': 'joined team',
  'proposal.created': 'created proposal',
  'proposal.deleted': 'deleted proposal',
  'proposal.resolved': 'resolved proposal',
  'vote.cast': 'voted on',
  'vote.changed': 'changed vote on',
  'comment.added': 'commented on',
};

export const getActivityFeed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name'),
      Activity.countDocuments(),
    ]);

    const mapped = activities.map((a) => ({
      id: a._id,
      userId: a.userId?._id || a.userId,
      userName: a.userName,
      action: a.action,
      actionLabel: ACTION_LABELS[a.action] || a.action,
      targetId: a.targetId,
      targetType: a.targetType,
      targetTitle: a.targetTitle,
      teamId: a.teamId,
      meta: a.meta,
      createdAt: a.createdAt,
    }));

    res.json({
      activities: mapped,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ message: 'Failed to fetch activity feed' });
  }
};
