// src/models/CustomerFollowup.js
import mongoose from 'mongoose';
const CustomerFollowupSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    followup_date: { type: Date, required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'done', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);
export default mongoose.model('CustomerFollowup', CustomerFollowupSchema);
