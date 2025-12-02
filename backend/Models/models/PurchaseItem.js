// src/models/PurchaseItem.js
import mongoose from 'mongoose';
const PurchaseItemSchema = new mongoose.Schema(
  {
    purchaseinvoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseInvoice', required: true, index: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    weight: { type: Number, default: 0 },
    stoneweight: { type: Number, default: 0 },
    makingcharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('PurchaseItem', PurchaseItemSchema);
