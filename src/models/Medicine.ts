import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  tenant?:        mongoose.Types.ObjectId;
  name:           string;
  genericName:    string;
  category:       string;
  manufacturer:   string;
  batchNumber:    string;
  expiryDate:     string;
  purchasePrice:  number;
  salePrice:      number;
  stock:          number;
  minStock:       number; // low stock alert threshold
  unit:           string; // tablets, ml, capsules, etc
  description:    string;
  active:         boolean;
}

const MedicineSchema = new Schema<IMedicine>({
  tenant:        { type: Schema.Types.ObjectId, ref: 'Tenant' },
  name:          { type: String, required: true },
  genericName:   { type: String, default: '' },
  category:      { type: String, enum: ['antibiotic','painkiller','vitamin','antacid','cardiac','diabetic','antihistamine','other'], default: 'other' },
  manufacturer:  { type: String, default: '' },
  batchNumber:   { type: String, default: '' },
  expiryDate:    { type: String, required: true },
  purchasePrice: { type: Number, default: 0 },
  salePrice:     { type: Number, required: true },
  stock:         { type: Number, default: 0 },
  minStock:      { type: Number, default: 10 },
  unit:          { type: String, enum: ['tablets','capsules','ml','mg','strips','bottles','injections','other'], default: 'tablets' },
  description:   { type: String, default: '' },
  active:        { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Medicine ||
  mongoose.model<IMedicine>('Medicine', MedicineSchema);