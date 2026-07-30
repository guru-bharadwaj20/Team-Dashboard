import mongoose from 'mongoose';

/**
 * Comments live in their own collection.
 *
 * They were previously an embedded array on Proposal. That array is unbounded, so
 * every new comment rewrote the entire proposal document (including all votes),
 * and a busy proposal would eventually approach the 16 MB BSON ceiling with no
 * way to page through the thread.
 *
 * Votes remain embedded on Proposal deliberately: they are bounded by team
 * membership, one per member, and are always read as a whole for tallying.
 */
const commentSchema = new mongoose.Schema(
  {
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// Serves the paginated thread read: newest-first within one proposal.
commentSchema.index({ proposalId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
