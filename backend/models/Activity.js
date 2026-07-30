import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS } from '../../shared/events.js';

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, default: 'System' },
    // Enum comes from the shared contract so it cannot drift from the labels.
    action: { type: String, required: true, enum: ACTIVITY_ACTIONS, index: true },
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
