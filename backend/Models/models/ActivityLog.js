// src/models/ActivityLog.js
import mongoose from 'mongoose';
const ActivityLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    table: { type: String, trim: true },
    record_id: { type: mongoose.Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);
export default mongoose.model('ActivityLog', ActivityLogSchema);
