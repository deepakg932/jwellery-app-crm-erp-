// src/models/Ledger.js
import mongoose from 'mongoose';
const ledgerSchema = new mongoose.Schema({
  partyType: {
    type: String,
    enum: ["CUSTOMER", "SUPPLIER"]
  },
  partyId: mongoose.Schema.Types.ObjectId,
  debit: Number,
  credit: Number,
  balance: Number,
  referenceId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model("Ledger", ledgerSchema);

