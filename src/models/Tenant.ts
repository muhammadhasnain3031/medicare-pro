import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name:        string;
  slug:        string; // citycare, alshifa etc
  email:       string;
  phone:       string;
  address:     string;
  logo:        string;
  primaryColor: string;
  plan:        'basic' | 'pro' | 'enterprise';
  active:      boolean;
  settings: {
    currency:  string;
    timezone:  string;
    language:  string;
  };
}

const TenantSchema = new Schema<ITenant>({
  name:         { type: String, required: true },
  slug:         { type: String, required: true, unique: true, lowercase: true },
  email:        { type: String, required: true },
  phone:        { type: String, default: '' },
  address:      { type: String, default: '' },
  logo:         { type: String, default: '' },
  primaryColor: { type: String, default: '#2563eb' },
  plan:         { type: String, enum: ['basic','pro','enterprise'], default: 'basic' },
  active:       { type: Boolean, default: true },
  settings: {
    currency:  { type: String, default: 'PKR' },
    timezone:  { type: String, default: 'Asia/Karachi' },
    language:  { type: String, default: 'en' },
  },
}, { timestamps: true });

export default mongoose.models.Tenant ||
  mongoose.model<ITenant>('Tenant', TenantSchema);