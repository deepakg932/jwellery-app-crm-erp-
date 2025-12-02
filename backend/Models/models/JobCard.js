// src/models/JobCard.js
import mongoose from 'mongoose';
import { JobType } from './_shared.js';
const JobCardSchema = new mongoose.Schema(
  {
    jobno: { type: String, required: true, unique: true },
    designno: { type: String, trim: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    type: { type: String, enum: JobType, required: true },
    assignedkarigar: { type: mongoose.Schema.Types.ObjectId, ref: 'Karigar', index: true },
    estimatedcost: { type: Number, default: 0 },
    startdate: { type: Date, default: Date.now },
    duedate: { type: Date },
    status: { type: String, enum: ['open', 'in-progress', 'completed', 'cancelled'], default: 'open', index: true },
  },
  { timestamps: true }
);
export default mongoose.model('JobCard', JobCardSchema);
