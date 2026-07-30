import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded'],
      default: 'new',
      index: true,
    },
  },
  // timestamps, rather than a hand-rolled createdAt. The manual field gave no
  // updatedAt and made this the only model not using the shared convention.
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 });

export default mongoose.model('Contact', contactSchema);
