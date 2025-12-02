
import mongoose from 'mongoose';
const RepairStageSchema = new mongoose.Schema(
  {
    repair_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true, index: true },
    stage: { type: String, required: true, trim: true }, // free-form or reuse JobStage if desired
    start: { type: Date },
    end: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);
RepairStageSchema.index({ repair_id: 1, stage: 1 }, { unique: true });
export default mongoose.model('RepairStage', RepairStageSchema);
