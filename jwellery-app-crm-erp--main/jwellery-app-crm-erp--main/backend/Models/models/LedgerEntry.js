// src/models/LedgerEntry.js
import mongoose from 'mongoose';
const LedgerEntrySchema = new mongoose.Schema(
  {
    ledger_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true, index: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    reference: { type: mongoose.Schema.Types.ObjectId }, // invoice, voucher, etc.
  },
  { timestamps: true }
);
export default mongoose.model('LedgerEntry', LedgerEntrySchema);
