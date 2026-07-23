// src/models/LoyaltyTransaction.js
import mongoose from 'mongoose';
import { LoyaltyType } from './_shared.js';
const LoyaltyTransactionSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    points: { type: Number, required: true },
    type: { type: String, enum: LoyaltyType, required: true },
    reference_id: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);
export default mongoose.model('LoyaltyTransaction', LoyaltyTransactionSchema);
