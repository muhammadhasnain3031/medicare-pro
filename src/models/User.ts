import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient'|'receptionist'|'nurse'|'lab';
  phone: string;
  avatar: string;
  // Doctor fields
  specialization?: string;
  qualification?: string;
  experience?: number;
  fee?: number;
  available?: boolean;
  schedule?: { day: string; startTime: string; endTime: string }[];
  // Patient fields
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  tenant?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  role:             { type: String,   enum: ['superadmin','admin','doctor','patient','receptionist','nurse','lab'], 
 required: true },
  phone:            { type: String, default: '' },
  avatar:           { type: String, default: '' },
  // Doctor
  specialization:   { type: String },
  qualification:    { type: String },
  experience:       { type: Number },
  fee:              { type: Number },
  available:        { type: Boolean, default: true },
  schedule:         [{ day: String, startTime: String, endTime: String }],
  // Patient
  dateOfBirth:      { type: String },
  bloodGroup:       { type: String },
  address:          { type: String },
  emergencyContact: { type: String },
  medicalHistory:   [String],
  

  tenant: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Tenant',
  required: false,
  
},
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);