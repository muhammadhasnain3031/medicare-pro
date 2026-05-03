import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  company: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);