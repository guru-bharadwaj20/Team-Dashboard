import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, default: 'System' },
    action: {
      type: String,
      required: true,
      enum: [
        'team.created', 'team.deleted', 'team.member_joined',
        'proposal.created', 'proposal.deleted', 'proposal.resolved',
        'vote.cast', 'vote.changed',
        'comment.added',
      ],
      index: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetType: { type: String, enum: ['team', 'proposal', 'comment'] },
    targetTitle: { type: String, default: '' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ teamId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
