import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  user:       mongoose.Types.ObjectId;
  userName:   string;
  userRole:   string;
  action:     string;
  module:     string;
  details:    string;
  ipAddress:  string;
  userAgent:  string;
  status:     'success' | 'failed' | 'warning';
  metadata?:  Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  user:      { type: Schema.Types.ObjectId, ref: 'User' },
  userName:  { type: String, default: '' },
  userRole:  { type: String, default: '' },
  action:    { type: String, required: true },
  module:    { type: String, required: true },
  details:   { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  status:    { type: String, enum: ['success','failed','warning'], default: 'success' },
  metadata:  { type: Schema.Types.Mixed },
}, { timestamps: true });

// Auto delete after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);