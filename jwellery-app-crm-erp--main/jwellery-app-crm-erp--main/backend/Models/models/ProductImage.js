// src/models/ProductImage.js
import mongoose from 'mongoose';
const ProductImageSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    imagepath: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);
export default mongoose.model('ProductImage', ProductImageSchema);
