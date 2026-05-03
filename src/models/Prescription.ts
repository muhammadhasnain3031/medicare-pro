import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  appointment: mongoose.Types.ObjectId;
  doctor:      mongoose.Types.ObjectId;
  patient:     mongoose.Types.ObjectId;
  diagnosis:   string;
  medicines: {
    name:         string;
    dosage:       string;
    duration:     string;
    instructions: string;
  }[];
  notes:       string;
  aiGenerated: boolean;
}

const PrescriptionSchema = new Schema<IPrescription>({
  appointment:  { type: Schema.Types.ObjectId, ref: 'Appointment' },
  doctor:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patient:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis:    { type: String, required: true },
  medicines:    [{
    name:         { type: String, required: true },
    dosage:       { type: String, required: true },
    duration:     { type: String, required: true },
    instructions: { type: String, default: '' },
  }],
  notes:        { type: String, default: '' },
  aiGenerated:  { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Prescription ||
  mongoose.model<IPrescription>('Prescription', PrescriptionSchema);