// src/models/PurchaseOrderItem.js
import mongoose from 'mongoose';
const PurchaseOrderItemSchema = new mongoose.Schema(
  {
    po_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    productname: { type: String, required: true, trim: true },
    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity', index: true },
    expectedweight: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
  },
  { timestamps: true }
);
export default mongoose.model('PurchaseOrderItem', PurchaseOrderItemSchema);
