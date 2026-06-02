import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], validate: [val => val.length === 2, '{PATH} must have exactly 2 elements'] },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
  isActive: { type: Boolean, default: true },
  lastMessage: {
    text: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

chatSchema.index({ participants: 1 });
chatSchema.index({ matchId: 1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
