import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor:  mongoose.Types.ObjectId;
  date:    string;
  time:    string;
  status:  'pending' | 'confirmed' | 'completed' | 'cancelled';
  type:    'checkup' | 'followup' | 'emergency' | 'consultation';
  symptoms:    string;
  notes?:      string;
  fee:         number;
}

const AppointmentSchema = new Schema<IAppointment>({
  patient:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: String, required: true },
  time:     { type: String, required: true },
  status:   { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  type:     { type: String, enum: ['checkup','followup','emergency','consultation'], default: 'checkup' },
  symptoms: { type: String, default: '' },
  notes:    { type: String },
  fee:      { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);