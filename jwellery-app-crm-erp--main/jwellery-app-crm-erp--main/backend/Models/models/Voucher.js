
import mongoose from 'mongoose';
import { VoucherType } from './_shared.js';
const VoucherSchema = new mongoose.Schema(
  {
    type: { type: String, enum: VoucherType, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
export default mongoose.model('Voucher', VoucherSchema);
