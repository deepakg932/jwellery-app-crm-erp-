// src/models/Product.js
import mongoose from 'mongoose';
import { MetalType, ProductStatus ,StoneType} from './_shared.js';

const ProductSchema = new mongoose.Schema(
  {
    // sku: { type: String, unique: true, required: true, trim: true },
    sku: { type: String, unique: true,  trim: true },
    barcode: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', index: true },
    purity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Purity', required: true, index: true },
    metaltype: { type: String, enum: MetalType, required: true },
    grossweight: { type: Number, required: true }, // DECIMAL(10,3)
    net_weight: { type: Number, required: true },
    stoneweight: { type: Number, default: 0 },
    wastage: { type: Number, default: 0 },
    makingcharge: { type: Number, default: 0 },
    stone_charge: { type: Number, default: 0 },
    certificationno: { type: String, trim: true },
    cost_price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stone_type: { type: String, enum: StoneType, default: 'none' },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    status: { type: String, enum: ProductStatus, default: 'in-stock', index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);
ProductSchema.index({ branch_id: 1, status: 1 });
export default mongoose.model('Product', ProductSchema);
