import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // lowercase + trim at the schema level so Alice@x.com and alice@x.com cannot
    // become two accounts regardless of which code path writes the document.
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
