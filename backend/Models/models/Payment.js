// src/models/Payment.js
import mongoose from 'mongoose';
import { PaymentMode } from './_shared.js';
const PaymentSchema = new mongoose.Schema(
  {
    invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: PaymentMode, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model('Payment', PaymentSchema);
