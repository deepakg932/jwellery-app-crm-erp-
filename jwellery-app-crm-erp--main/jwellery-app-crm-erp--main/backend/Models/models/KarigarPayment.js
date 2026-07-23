// src/models/KarigarPayment.js
import mongoose from 'mongoose';
const KarigarPaymentSchema = new mongoose.Schema(
  {
    karigar_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Karigar', required: true, index: true },
    jobcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', index: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('KarigarPayment', KarigarPaymentSchema);
