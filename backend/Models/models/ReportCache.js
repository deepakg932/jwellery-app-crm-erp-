
import mongoose from 'mongoose';
const ReportCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, 
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    generated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('ReportCache', ReportCacheSchema);
