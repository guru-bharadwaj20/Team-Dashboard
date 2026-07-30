import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['info', 'success', 'warning', 'error'], 
      default: 'info' 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String }, // Optional link to related resource
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of related proposal/team
    relatedType: { type: String, enum: ['proposal', 'team', 'comment'] },
  },
  { timestamps: true }
);

// Every read of this collection is "my notifications, newest first", and the
// unread count filters on read. Neither was indexed.
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ relatedId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
