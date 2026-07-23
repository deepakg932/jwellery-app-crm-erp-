// src/models/Ledger.js
import mongoose from 'mongoose';
const LedgerSchema = new mongoose.Schema(
  {
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', index: true },
  },
  { timestamps: true }
);
export default mongoose.model('Ledger', LedgerSchema);
