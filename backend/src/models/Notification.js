import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['new_match', 'chat_message', 'claim_request', 'claim_approved', 'claim_rejected', 'item_returned', 'new_found_nearby', 'system', 'challenge_received', 'challenge_approved', 'challenge_rejected'],
    required: true 
  },
  data: {
    itemId: { type: mongoose.Schema.Types.ObjectId },
    matchId: { type: mongoose.Schema.Types.ObjectId },
    chatId: { type: mongoose.Schema.Types.ObjectId },
    claimId: { type: mongoose.Schema.Types.ObjectId },
    challengeId: { type: mongoose.Schema.Types.ObjectId }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
