// src/models/Payment.js
import mongoose from 'mongoose';
import { PaymentMode } from './_shared.js';
const paymentSchema = new mongoose.Schema({
  partyType: String,
  partyId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  mode: {
    type: String,
    enum: ["CASH", "UPI", "BANK", "CARD"]
  },
  referenceId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);

