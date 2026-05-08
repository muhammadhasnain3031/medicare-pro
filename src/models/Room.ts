import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  tenant?:      mongoose.Types.ObjectId;
  roomNumber:   string;
  type:         'general' | 'private' | 'semi-private' | 'icu' | 'emergency' | 'operation';
  floor:        string;
  ward:         string;
  capacity:     number;
  status:       'available' | 'occupied' | 'maintenance' | 'reserved';
  dailyCharge:  number;
  facilities:   string[];
  currentPatient?: mongoose.Types.ObjectId;
  notes:        string;
}

const RoomSchema = new Schema<IRoom>({
  tenant:         { type: Schema.Types.ObjectId, ref: 'Tenant' },
  roomNumber:     { type: String, required: true },
  type:           { type: String, enum: ['general','private','semi-private','icu','emergency','operation'], default: 'general' },
  floor:          { type: String, default: '1' },
  ward:           { type: String, default: 'General' },
  capacity:       { type: Number, default: 1 },
  status:         { type: String, enum: ['available','occupied','maintenance','reserved'], default: 'available' },
  dailyCharge:    { type: Number, default: 2000 },
  facilities:     [String],
  currentPatient: { type: Schema.Types.ObjectId, ref: 'User' },
  notes:          { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Room ||
  mongoose.model<IRoom>('Room', RoomSchema);