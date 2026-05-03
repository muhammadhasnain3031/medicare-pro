import mongoose, { Schema, Document } from 'mongoose';

export interface ILabTest extends Document {
  patient:       mongoose.Types.ObjectId;
  doctor?:       mongoose.Types.ObjectId;
  testName:      string;
  testType:      string;
  price:         number;
  status:        'pending' | 'processing' | 'completed' | 'cancelled';
  priority:      'normal' | 'urgent' | 'emergency';
  result:        string;
  notes:         string;
  reportUrl:     string;
  paid:          boolean;
  paymentMethod: string;
}

const LabTestSchema = new Schema<ILabTest>({
  patient:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:        { type: Schema.Types.ObjectId, ref: 'User' },
  testName:      { type: String, required: true },
  testType:      { type: String, enum: ['blood','urine','xray','mri','ultrasound','ecg','other'], default: 'blood' },
  price:         { type: Number, default: 0 },
  status:        { type: String, enum: ['pending','processing','completed','cancelled'], default: 'pending' },
  priority:      { type: String, enum: ['normal','urgent','emergency'], default: 'normal' },
  result:        { type: String, default: '' },
  notes:         { type: String, default: '' },
  reportUrl:     { type: String, default: '' },
  paid:          { type: Boolean, default: false },
  paymentMethod: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.LabTest ||
  mongoose.model<ILabTest>('LabTest', LabTestSchema);