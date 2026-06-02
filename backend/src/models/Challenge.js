import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
  finderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{
    question: { type: String, required: true },
    expectedAnswer: { type: String, required: true }
  }],
  status: { type: String, enum: ['pending_owner_response', 'approved', 'rejected'], default: 'pending_owner_response' },
  ownerAnswers: [{
    questionIndex: Number,
    answer: String
  }],
  score: { type: Number },
  canRetry: { type: Boolean, default: false },
  attemptNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
