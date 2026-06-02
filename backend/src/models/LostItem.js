import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'mobile_phone', 'wallet', 'laptop', 'id_card', 'keys',
      'earbuds', 'books', 'documents', 'bags', 'jewelry',
      'clothing', 'sports_equipment', 'other'
    ] 
  },
  description: { type: String, required: true, maxlength: 1000 },
  color: { type: String, trim: true },
  brand: { type: String, trim: true },
  dateLost: { type: Date, required: true },
  timeLost: { type: String }, // HH:MM format
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    address: { type: String, required: true },
    area: { type: String },
    city: { type: String }
  },
  images: { 
    type: [String], 
    validate: [val => val.length <= 5, 'Exceeds the limit of 5 images'] 
  },
  imageEmbeddings: { type: [[Number]], select: false },
  rewardAmount: { type: Number, default: 0, min: 0 },
  contactPreference: { type: String, enum: ['chat', 'phone', 'email'], default: 'chat' },
  verificationQuestions: [{
    question: { type: String, required: true },
    answer: { type: String, required: true, select: false }
  }],
  status: { type: String, enum: ['active', 'matched', 'returned', 'expired'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  featuredUntil: { type: Date },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

lostItemSchema.index({ userId: 1, status: 1 });
lostItemSchema.index({ category: 1, status: 1 });
lostItemSchema.index({ createdAt: -1 });

const LostItem = mongoose.model('LostItem', lostItemSchema);
export default LostItem;
