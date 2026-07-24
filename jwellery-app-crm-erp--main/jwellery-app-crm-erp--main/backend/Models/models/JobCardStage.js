import mongoose from 'mongoose';

const JobCardStageSchema = new mongoose.Schema(
  {
    jobcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, index: true },
    stage: { type: String, enum: ['design', 'cad', 'casting', 'filing', 'setting', 'polishing', 'plating', 'quality', 'packaging'], required: true },
    status: { type: String, enum: ['pending', 'ongoing', 'in-progress', 'done', 'completed', 'approved', 'rejected'], default: 'pending' },
    start_date: { type: Date },
    end_date: { type: Date },
    start: { type: Date },
    end: { type: Date },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    assigned_karigar: { type: mongoose.Schema.Types.ObjectId, ref: 'Karigar' },
    notes: { type: String, trim: true, default: '' },
    remarks: { type: String, trim: true, default: '' },
    weight: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

JobCardStageSchema.index({ jobcard_id: 1, stage: 1 }, { unique: true });

export default mongoose.model('JobCardStage', JobCardStageSchema);
