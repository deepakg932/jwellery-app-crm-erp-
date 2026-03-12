
import mongoose from 'mongoose';
const WastageLogSchema = new mongoose.Schema(
  {
    job_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, index: true },
    weight_loss: { type: Number, required: true },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model('WastageLog', WastageLogSchema);
