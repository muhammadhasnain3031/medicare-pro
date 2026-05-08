import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  adminEmail: { type: String, required: true },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);