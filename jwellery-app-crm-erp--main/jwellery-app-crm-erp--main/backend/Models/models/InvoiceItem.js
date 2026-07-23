// src/models/InvoiceItem.js
import mongoose from 'mongoose';
const InvoiceItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    weight: { type: Number, default: 0 },
    price: { type: Number, required: true },
    making_charge: { type: Number, default: 0 },
    stone_charge: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);
export default InvoiceItemSchema;
