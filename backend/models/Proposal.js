import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vote: { type: String, enum: ['agree', 'disagree', 'neutral'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const proposalSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    options: [optionSchema],
    votes: [voteSchema],
    comments: [commentSchema],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
