import mongoose from 'mongoose';

const foundItemSchema = new mongoose.Schema({
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
  dateFound: { type: Date, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [longitude, latitude]
    address: { type: String, required: true },
    area: { type: String },
    city: { type: String }
  },
  verificationQuestions: {
    type: [{
      question: { type: String, required: true },
      answer: { type: String, required: true, select: false },
      answerType: { type: String, enum: ['exact', 'keyword', 'numeric', 'descriptive', 'generic'], required: true },
      hint: { type: String }
    }],
    validate: [val => val.length === 2, 'Exactly 2 verification questions are required']
  },
  images: { 
    type: [String], 
    validate: [val => val.length <= 5, 'Exceeds the limit of 5 images'] 
  },
  imageEmbeddings: { type: [[Number]], select: false },
  additionalNotes: { type: String, maxlength: 500 },
  status: { type: String, enum: ['available', 'claimed', 'returned'], default: 'available' },
  handoverLocation: { type: String },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

foundItemSchema.index({ userId: 1, status: 1 });
foundItemSchema.index({ category: 1, status: 1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);
export default FoundItem;
