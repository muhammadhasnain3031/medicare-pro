import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  tenant?:         mongoose.Types.ObjectId;
  patient:         mongoose.Types.ObjectId;
  doctor:          mongoose.Types.ObjectId;
  room:            mongoose.Types.ObjectId;
  admissionDate:   string;
  dischargeDate?:  string;
  status:          'admitted' | 'discharged' | 'transferred';
  diagnosis:       string;
  admissionType:   'emergency' | 'planned' | 'transfer';
  totalDays?:      number;
  totalCharges?:   number;
  notes:           string;
  vitalSigns: {
    bp:          string;
    pulse:       string;
    temp:        string;
    oxygen:      string;
    recordedAt:  string;
  }[];
  dischargeSummary?: string;
}

const AdmissionSchema = new Schema<IAdmission>({
  tenant:          { type: Schema.Types.ObjectId, ref: 'Tenant' },
  patient:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room:            { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  admissionDate:   { type: String, required: true },
  dischargeDate:   { type: String },
  status:          { type: String, enum: ['admitted','discharged','transferred'], default: 'admitted' },
  diagnosis:       { type: String, default: '' },
  admissionType:   { type: String, enum: ['emergency','planned','transfer'], default: 'planned' },
  totalDays:       { type: Number, default: 0 },
  totalCharges:    { type: Number, default: 0 },
  notes:           { type: String, default: '' },
  vitalSigns:      [{
    bp:         String,
    pulse:      String,
    temp:       String,
    oxygen:     String,
    recordedAt: String,
  }],
  dischargeSummary:{ type: String },
}, { timestamps: true });

export default mongoose.models.Admission ||
  mongoose.model<IAdmission>('Admission', AdmissionSchema);