// src/models/JobCardStage.js
import mongoose from 'mongoose';
import { JobStage } from './_shared.js';
const JobCardStageSchema = new mongoose.Schema(
  {
    jobcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, index: true },
    stage: { type: String, enum: JobStage, required: true },
    start: { type: Date },
    end: { type: Date },
    status: { type: String, enum: ['pending', 'ongoing', 'done'], default: 'pending' },
    notes: { type: String, trim: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);
JobCardStageSchema.index({ jobcard_id: 1, stage: 1 }, { unique: true });
export default mongoose.model('JobCardStage', JobCardStageSchema);
