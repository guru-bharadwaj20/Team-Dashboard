import mongoose from 'mongoose';
import crypto from 'crypto';

/** 16 bytes of entropy, up from 6 — a share code is an unguessable capability. */
export const generateShareId = () => crypto.randomBytes(16).toString('hex');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shareId: { type: String, unique: true, index: true, default: generateShareId },
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
export default Team;
