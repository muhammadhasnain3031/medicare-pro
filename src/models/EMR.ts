import mongoose, { Schema, Document } from 'mongoose';

export interface IEMR extends Document {
  patient:          mongoose.Types.ObjectId;
  tenant?:          mongoose.Types.ObjectId;
  bloodGroup:       string;
  allergies:        string[];
  chronicConditions:string[];
  currentMedications:string[];
  vaccinationHistory:{ name: string; date: string; nextDue?: string }[];
  surgicalHistory:  { procedure: string; date: string; hospital: string }[];
  familyHistory:    string;
  height:           number;
  weight:           number;
  bmi?:             number;
  visits: {
    date:        string;
    doctor:      mongoose.Types.ObjectId;
    diagnosis:   string;
    treatment:   string;
    notes:       string;
    vitals: {
      bp:     string;
      pulse:  string;
      temp:   string;
      weight: string;
    };
  }[];
  documents: {
    name:       string;
    type:       string;
    url:        string;
    uploadedAt: string;
  }[];
  aiSummary:  string;
  lastUpdated:string;
}

const EMRSchema = new Schema<IEMR>({
  patient:           { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tenant:            { type: Schema.Types.ObjectId, ref: 'Tenant' },
  bloodGroup:        { type: String, default: '' },
  allergies:         [String],
  chronicConditions: [String],
  currentMedications:[String],
  vaccinationHistory:[{ name: String, date: String, nextDue: String }],
  surgicalHistory:   [{ procedure: String, date: String, hospital: String }],
  familyHistory:     { type: String, default: '' },
  height:            { type: Number, default: 0 },
  weight:            { type: Number, default: 0 },
  bmi:               { type: Number },
  visits: [{
    date:      String,
    doctor:    { type: Schema.Types.ObjectId, ref: 'User' },
    diagnosis: String,
    treatment: String,
    notes:     String,
    vitals: { bp: String, pulse: String, temp: String, weight: String },
  }],
  documents: [{
    name:       String,
    type:       String,
    url:        String,
    uploadedAt: String,
  }],
  aiSummary:  { type: String, default: '' },
  lastUpdated:{ type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.EMR ||
  mongoose.model<IEMR>('EMR', EMRSchema);