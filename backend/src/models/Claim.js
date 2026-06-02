import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['lost', 'found'], required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  ownerAnswers: [{
    questionIndex: { type: Number, required: true },
    answer: { type: String, required: true }
  }],
  score: { type: Number, default: 0 },
  canRetry: { type: Boolean, default: false },
  attemptNumber: { type: Number, default: 1 },
  previousClaimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
  rejectionReason: { type: String },
  claimedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
