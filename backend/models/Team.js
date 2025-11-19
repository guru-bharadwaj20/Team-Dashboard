import mongoose from 'mongoose';
import crypto from 'crypto';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shareId: { type: String, unique: true, default: () => crypto.randomBytes(6).toString('hex') },
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
export default Team;
