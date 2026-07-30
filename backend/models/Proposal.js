import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({ text: { type: String, required: true } });

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vote: { type: String, enum: ['agree', 'disagree', 'neutral'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const aiSummarySchema = new mongoose.Schema({
  executiveSummary: String,
  supportingArguments: [String],
  opposingArguments: [String],
  outcome: String,
  nextAction: String,
  generatedAt: { type: Date, default: Date.now },
}, { _id: false });

const proposalSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['open', 'closed', 'pending', 'resolved'], default: 'open', index: true },
    options: [optionSchema],
    // Bounded by team membership (one per member) and always read whole for
    // tallying, so votes stay embedded. Comments do not — see models/Comment.js.
    votes: [voteSchema],
    // Denormalised count so proposal lists do not have to join the thread.
    commentCount: { type: Number, default: 0, min: 0 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deadline: { type: Date },
    // Consensus fields
    consensusReached: { type: Boolean, default: false },
    consensusPercentage: { type: Number, default: 0 },
    closedAt: { type: Date },
    // AI-generated decision summary
    aiSummary: { type: aiSummarySchema, default: null },
  },
  { timestamps: true }
);

// Compound index for efficient team-based queries
proposalSchema.index({ teamId: 1, createdAt: -1 });
// Serves the deadline sweeper, which scans open proposals past their deadline.
proposalSchema.index({ status: 1, deadline: 1 });

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
