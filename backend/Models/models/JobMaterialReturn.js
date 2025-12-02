// src/models/JobMaterialReturn.js
import mongoose from 'mongoose';
const JobMaterialReturnSchema = new mongoose.Schema(
  {
    job_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, index: true },
    material_type: { type: String, enum: ['gold', 'stone'], required: true },
    weight: { type: Number, required: true },
    wastage: { type: Number, default: 0 },
    returned_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('JobMaterialReturn', JobMaterialReturnSchema);
