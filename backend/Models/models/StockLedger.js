
import mongoose from 'mongoose';
import { StockMovementType } from './_shared.js';

const StockLedgerSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    type: { type: String, enum: StockMovementType, required: true },
    qty: { type: Number, default: 1 },
    weight: { type: Number, default: 0 },
    reference_id: { type: mongoose.Schema.Types.ObjectId }, // link to invoice/transfer/job etc.
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);
export default mongoose.model('StockLedger', StockLedgerSchema);
