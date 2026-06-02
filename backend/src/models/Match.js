import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  lostUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foundUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: {
    imageScore: { type: Number },
    categoryScore: { type: Number },
    colorScore: { type: Number },
    locationScore: { type: Number }
  },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  isNotified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

matchSchema.index({ lostItemId: 1, score: -1 });
matchSchema.index({ foundItemId: 1, score: -1 });
matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;
