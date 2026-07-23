// src/models/PurchaseOrder.js
import mongoose from 'mongoose';
const PurchaseOrderSchema = new mongoose.Schema(
  {
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    orderdate: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'approved', 'received', 'cancelled'], default: 'draft', index: true },
    totalitems: { type: Number, default: 0 },
    createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);
