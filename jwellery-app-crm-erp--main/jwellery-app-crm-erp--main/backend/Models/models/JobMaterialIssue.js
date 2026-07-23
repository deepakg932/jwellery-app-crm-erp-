// src/models/JobMaterialIssue.js
import mongoose from 'mongoose';
const JobMaterialIssueSchema = new mongoose.Schema(
  {
    job_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, index: true },
    material_type: { type: String, enum: ['gold', 'stone'], required: true },
    weight: { type: Number, required: true },
    issued_to_karigar: { type: mongoose.Schema.Types.ObjectId, ref: 'Karigar', index: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('JobMaterialIssue', JobMaterialIssueSchema);
