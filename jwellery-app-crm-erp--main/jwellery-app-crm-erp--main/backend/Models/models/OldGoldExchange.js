// src/models/OldGoldExchange.js
import mongoose from 'mongoose';
const OldGoldExchangeSchema = new mongoose.Schema(
  {
    invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    weight: { type: Number, required: true },
    purity: { type: String, required: true }, // textual e.g. 22K
    rate: { type: Number, required: true },
    value: { type: Number, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('OldGoldExchange', OldGoldExchangeSchema);
w