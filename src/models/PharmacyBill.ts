import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacyBill extends Document {
  tenant?:       mongoose.Types.ObjectId;
  patient?:      mongoose.Types.ObjectId;
  prescription?: mongoose.Types.ObjectId;
  billNumber:    string;
  items: {
    medicine:    mongoose.Types.ObjectId;
    medicineName: string;
    quantity:    number;
    unitPrice:   number;
    total:       number;
  }[];
  subtotal:      number;
  discount:      number;
  tax:           number;
  totalAmount:   number;
  paid:          boolean;
  paymentMethod: string;
  notes:         string;
}

const PharmacyBillSchema = new Schema<IPharmacyBill>({
  tenant:        { type: Schema.Types.ObjectId, ref: 'Tenant' },
  patient:       { type: Schema.Types.ObjectId, ref: 'User' },
  prescription:  { type: Schema.Types.ObjectId, ref: 'Prescription' },
  billNumber:    { type: String, required: true, unique: true },
  items: [{
    medicine:    { type: Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName:{ type: String },
    quantity:    { type: Number, required: true },
    unitPrice:   { type: Number, required: true },
    total:       { type: Number, required: true },
  }],
  subtotal:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  tax:           { type: Number, default: 0 },
  totalAmount:   { type: Number, default: 0 },
  paid:          { type: Boolean, default: false },
  paymentMethod: { type: String, default: '' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.PharmacyBill ||
  mongoose.model<IPharmacyBill>('PharmacyBill', PharmacyBillSchema);