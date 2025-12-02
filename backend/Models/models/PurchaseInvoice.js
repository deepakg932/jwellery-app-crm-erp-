// src/models/PurchaseInvoice.js
import mongoose from 'mongoose';
const PurchaseInvoiceSchema = new mongoose.Schema(
  {
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    invoice_no: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    netamount: { type: Number, required: true },
  },
  { timestamps: true }
);
PurchaseInvoiceSchema.index({ vendor_id: 1, invoice_no: 1 }, { unique: true });
export default mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema);
