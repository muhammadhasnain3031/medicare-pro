import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  recipient:   string;
  phone:       string;
  channel:     'whatsapp' | 'sms';
  type:        string;
  message:     string;
  status:      'sent' | 'failed' | 'pending';
  error?:      string;
  sid?:        string;
  sentBy?:     mongoose.Types.ObjectId;
}

const NotificationLogSchema = new Schema<INotificationLog>({
  recipient: { type: String, default: '' },
  phone:     { type: String, required: true },
  channel:   { type: String, enum: ['whatsapp','sms'], default: 'whatsapp' },
  type:      { type: String, required: true },
  message:   { type: String, required: true },
  status:    { type: String, enum: ['sent','failed','pending'], default: 'pending' },
  error:     { type: String },
  sid:       { type: String },
  sentBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);